import '../sass/form-builder.scss'
import throttle from 'lodash/throttle'
import Dom from './dom'
import { remove } from './dom'
import { Data } from './data'
import mi18n from 'mi18n'
import events from './events'
import layout from './layout'
import Helpers from './helpers'
import { defaultOptions, defaultI18n, config } from './config'
import Controls from './controls'
import boolAttribute from './control/controlAttributes/boolAttribute'
import numberAttribute from './control/controlAttributes/numberAttribute'
import {
  subtract,
  hyphenCase,
  nameAttr,
  trimObj,
  forEach,
  markup,
  attrString,
  parsedHtml,
  addEventListeners,
  closest,
  safename,
  forceNumber,
} from './utils'
import { css_prefix_text } from '../fonts/config.json'
import optionsAttribute from './control/controlAttributes/optionsAttribute'

const DEFAULT_TIMEOUT = 333

const FormBuilder = function(opts, element, $) {
  const formBuilder = this
  const i18n = mi18n.current
  const formID = `frmb-${new Date().getTime()}`
  const data = new Data(formID)
  const d = new Dom(formID)

  // prepare a new layout object with appropriate templates
  if (!opts.layout) {
    opts.layout = layout
  }
  const layoutEngine = new opts.layout(opts.layoutTemplates, true)

  const h = new Helpers(formID, layoutEngine, formBuilder)
  const m = markup
  opts = h.processOptions(opts)
  data.layout = h.editorLayout(opts.controlPosition)
  h.editorUI(formID)
  data.formID = formID
  data.lastID = `${data.formID}-fld-0`
  const controls = new Controls(opts, d)

  config.subtypes = h.processSubtypes(opts.subtypes)

  const $stage = $(d.stage)
  const $cbUL = $(d.controls)

  // Sortable fields
  $stage.sortable({
    cursor: 'move',
    opacity: 0.9,
    revert: 150,
    beforeStop: (evt, ui) => h.beforeStop.call(h, evt, ui),
    start: (evt, ui) => h.startMoving.call(h, evt, ui),
    stop: (evt, ui) => h.stopMoving.call(h, evt, ui),
    cancel: ['input', 'select', 'textarea', '.disabled-field', '.form-elements', '.btn', 'button', '.is-locked'].join(
      ', ',
    ),
    placeholder: 'frmb-placeholder',
  })

  if (!opts.allowStageSort) {
    $stage.sortable('disable')
  }

  // ControlBox with different fields
  $cbUL.sortable({
    helper: 'clone',
    opacity: 0.9,
    connectWith: $stage,
    cancel: '.formbuilder-separator',
    cursor: 'move',
    scroll: false,
    placeholder: 'ui-state-highlight',
    start: (evt, ui) => h.startMoving.call(h, evt, ui),
    stop: (evt, ui) => h.stopMoving.call(h, evt, ui),
    revert: 150,
    beforeStop: (evt, ui) => h.beforeStop.call(h, evt, ui),
    distance: 3,
    update: function(event, ui) {
      if (h.doCancel) {
        return false
      }

      if (ui.item.parent()[0] === d.stage) {
        h.doCancel = true
        processControl(ui.item)
      } else {
        h.setFieldOrder($cbUL)
        h.doCancel = !opts.sortableControls
      }
    },
  })

  const processControl = control => {
    if (control[0].classList.contains('input-set-control')) {
      const inputSets = []
      const inputSet = opts.inputSets.find(set => hyphenCase(set.name || set.label) === control[0].dataset.type)
      if (inputSet && inputSet.showHeader) {
        const header = {
          type: 'header',
          subtype: 'h2',
          id: inputSet.name,
          label: inputSet.label,
        }
        inputSets.push(header)
      }

      inputSets.push(...inputSet.fields)
      inputSets.forEach(field => {
        prepFieldVars(field, true)
        if (h.stopIndex || h.stopIndex === 0) {
          h.stopIndex++
        }
      })
    } else {
      prepFieldVars(control, true)
    }
  }

  const $editorWrap = $(d.editorWrap)

  const cbWrap = m('div', d.controls, {
    id: `${data.formID}-cb-wrap`,
    className: `cb-wrap ${data.layout.controls}`,
  })

  if (opts.showActionButtons) {
    cbWrap.appendChild(d.formActions)
  }

  $editorWrap.append(d.stage, cbWrap)

  if (element.type !== 'textarea') {
    $(element).append($editorWrap)
  } else {
    // formBuilder no longer uses textArea for element
    $(element).replaceWith($editorWrap)
  }

  $(d.controls).on('click', 'li', ({ target }) => {
    const $control = $(target).closest('li')
    h.stopIndex = undefined
    processControl($control)
    h.save.call(h)
  })

  // Add append and prepend options if necessary
  const nonEditableFields = () => {
    const cancelArray = []
    const disabledField = type =>
      m('li', opts[type], {
        className: `disabled-field form-${type}`,
      })

    if (opts.prepend && !$('.disabled-field.form-prepend', d.stage).length) {
      cancelArray.push(true)
      $stage.prepend(disabledField('prepend'))
    }

    if (opts.append && !$('.disabled-field.form-.append', d.stage).length) {
      cancelArray.push(true)
      $stage.append(disabledField('append'))
    }

    h.disabledTT(d.stage)
    return cancelArray.some(elem => elem === true)
  }

  // builds the standard formbuilder datastructure for a field definition
  const prepFieldVars = function($field, isNew = false) {
    let field = {}
    if ($field instanceof jQuery) {
      // get the default type etc & label for this field
      field.type = $field[0].dataset.type
      if (field.type) {
        // check for a custom type
        const custom = controls.custom.lookup(field.type)
        if (custom) {
          field = Object.assign({}, custom)
        } else {
          const controlClass = controls.getClass(field.type)
          field.label = controlClass.label(field.type)
        }

        // @todo: any other attrs ever set in aFields? value or selected?
      } else {
        // is dataType XML
        const attrs = $field[0].attributes
        if (!isNew) {
          field.values = $field.children().map((index, elem) => {
            return {
              label: $(elem).text(),
              value: $(elem).attr('value'),
              selected: Boolean($(elem).attr('selected')),
            }
          })
        }

        for (let i = attrs.length - 1; i >= 0; i--) {
          field[attrs[i].name] = attrs[i].value
        }
      }
    } else {
      field = Object.assign({}, $field)
    }

    if (!field.name) {
      field.name = nameAttr(field)
    }

    if (isNew && ['text', 'number', 'file', 'date', 'select', 'textarea', 'autocomplete'].includes(field.type)) {
      field.className = field.className || 'form-control'
    }

    const match = /(?:^|\s)btn-(.*?)(?:\s|$)/g.exec(field.className)
    if (match) {
      field.style = match[1]
    }

    if (isNew) {
      const eventTimeout = setTimeout(() => {
        document.dispatchEvent(events.fieldAdded)
        clearTimeout(eventTimeout)
      }, 10)
    }

    appendNewField(field, isNew)
    opts.onAddField(data.lastID, field)

    d.stage.classList.remove('empty')
  }

  // Parse saved XML template data
  const loadFields = function(formData) {
    formData = h.getData(formData)
    if (formData && formData.length) {
      formData.forEach(fieldData => prepFieldVars(trimObj(fieldData)))
      d.stage.classList.remove('empty')
    } else if (opts.defaultFields && opts.defaultFields.length) {
      // Load default fields if none are set
      opts.defaultFields.forEach(field => prepFieldVars(field))
      d.stage.classList.remove('empty')
    } else if (!opts.prepend && !opts.append) {
      d.stage.classList.add('empty')
      d.stage.dataset.content = mi18n.get('getStarted')
    }

    if (nonEditableFields()) {
      d.stage.classList.remove('empty')
    }

    h.save()
  }

  /**
   * Build the editable properties for the field
   * @param  {object} values configuration object for advanced fields
   * @return {String}        markup for advanced fields
   */
  const advFields = values => {
    const { type } = values
    const controlClass = controls.getClass(type)
    const fieldAttrs = (controlClass.fieldTypes) ? controlClass.fieldTypes(type) : []
    const context = { data: data, mi18n: mi18n, stage: $stage, opts: opts, helper: h, controls: controls, controlClass: controlClass }

    const advFields = []

    const noDisable = ['name', 'className']

    Object.keys(fieldAttrs).forEach(index => {
      const attr = fieldAttrs[index]
      const useDefaultAttr = [true]
      const isDisabled = opts.disabledAttrs.includes(attr)

      if (opts.typeUserDisabledAttrs[type]) {
        const typeDisabledAttrs = opts.typeUserDisabledAttrs[type]
        useDefaultAttr.push(!typeDisabledAttrs.includes(attr))
      }

      if (opts.typeUserAttrs[type]) {
        const userAttrs = Object.keys(opts.typeUserAttrs[type])
        useDefaultAttr.push(!userAttrs.includes(attr))
      }

      if (isDisabled && !noDisable.includes(attr)) {
        useDefaultAttr.push(false)
      }

      if (useDefaultAttr.every(Boolean)) {
        const attrClass = controls.getAttributeClass(attr)
        advFields.push(new attrClass(context, attr, values).getDomDisplay(isDisabled))
      }
    })

    // Append custom attributes as defined in typeUserAttrs option
    if (opts.typeUserAttrs[type]) {
      const customAttr = processTypeUserAttrs(opts.typeUserAttrs[type], values)
      advFields.push(customAttr)
    }

    return advFields.join('')
  }

  /**
   * Detects the type of user defined attribute
   * @param {Object} attrData attribute config
   * @return {String} type of user attr
   */
  function userAttrType(attrData) {
    return (
      [
        ['array', ({ options }) => !!options],
        ['boolean', ({ type }) => type === 'checkbox'], // automatic bool if checkbox
        [typeof attrData.value, () => true], // string, number,
      ].find(typeCondition => typeCondition[1](attrData))[0] || 'string'
    )
  }

  /**
   * Processes typeUserAttrs
   * @param  {Object} typeUserAttr option
   * @param  {Object} values       field attributes
   * @return {String}              markup for custom user attributes
   */
  function processTypeUserAttrs(typeUserAttr, values) {
    const advField = []
    const attrTypeMap = {
      array: selectUserAttrs,
      string: inputUserAttrs,
      number: (attr, attrData) => {
        //numberAttribute,
        const values = {...attrData }
        //values.type = attr
        const context = { data: data, mi18n: mi18n, stage: $stage, opts: opts, helper: h, controls: controls, controlClass: null }
        const attributeClass = new numberAttribute(context, attr, values)
        return attributeClass.getDomDisplay()
      },
      boolean: (attr, attrData) => {
        let isChecked = false
        if (attr.type === 'checkbox') {
          isChecked = Boolean(attrData.hasOwnProperty('value') ? attrData.value : false)
        } else if (values.hasOwnProperty(attr)) {
          isChecked = values[attr]
        } else if (attrData.hasOwnProperty('value') || attrData.hasOwnProperty('checked')) {
          isChecked = attrData.value || attrData.checked || false
        }
        const context = { data: data, mi18n: mi18n, stage: $stage, opts: opts, helper: h, controls: controls, controlClass: null }
        const attributeClass = new boolAttribute(context, attr, { ...attrData, [attr]: isChecked })
        return attributeClass.getDomDisplayForBool({ first: attrData.label }, false)
        //return boolAttribute(attr, { ...attrData, [attr]: isChecked }, { first: attrData.label })
      },
    }

    for (const attribute in typeUserAttr) {
      if (typeUserAttr.hasOwnProperty(attribute)) {
        const attrValType = userAttrType(typeUserAttr[attribute])
        const orig = mi18n.get(attribute)
        const tUA = typeUserAttr[attribute]
        const origValue = tUA.value || ''
        tUA.value = values[attribute] || tUA.value || ''

        if (tUA.label) {
          i18n[attribute] = Array.isArray(tUA.label) ? mi18n.get(...tUA.label) || tUA.label[0] : tUA.label
        }

        if (attrTypeMap[attrValType]) {
          advField.push(attrTypeMap[attrValType](attribute, tUA))
        }

        i18n[attribute] = orig
        tUA.value = origValue
      }
    }

    return advField.join('')
  }

  /**
   * Text input value for attribute
   * @param  {String} name
   * @param  {Object} inputAttrs also known as values
   * @return {String}       input markup
   */
  function inputUserAttrs(name, inputAttrs) {
    const { class: classname, className, ...attrs } = inputAttrs
    let textAttrs = {
      id: name + '-' + data.lastID,
      title: attrs.description || attrs.label || name.toUpperCase(),
      name: name,
      type: attrs.type || 'text',
      className: [`fld-${name}`, (classname || className || '').trim()],
    }
    const label = `<label for="${textAttrs.id}">${i18n[name] || ''}</label>`

    const optionInputs = ['checkbox', 'checkbox-group', 'radio-group']
    if (!optionInputs.includes(textAttrs.type)) {
      textAttrs.className.push('form-control')
    }

    textAttrs = Object.assign({}, attrs, textAttrs)
    const textInput = `<input ${attrString(textAttrs)}>`
    const inputWrap = `<div class="input-wrap">${textInput}</div>`
    return `<div class="form-group ${name}-wrap">${label}${inputWrap}</div>`
  }

  /**
   * Select input for multiple choice user attributes
   * @todo  replace with selectAttr
   * @param  {String} name
   * @param  {Object} fieldData
   * @return {String}         select markup
   */
  function selectUserAttrs(name, fieldData) {
    const { multiple, options, label: labelText, value, class: classname, className, ...restData } = fieldData
    const optis = Object.keys(options).map(val => {
      const attrs = { value: val }
      const optionTextVal = options[val]
      const optionText = Array.isArray(optionTextVal) ? mi18n.get(...optionTextVal) || optionTextVal[0] : optionTextVal
      if (Array.isArray(value) ? value.includes(val) : val === value) {
        attrs.selected = null
      }

      return m('option', optionText, attrs)
    })

    const selectAttrs = {
      id: `${name}-${data.lastID}`,
      title: restData.description || labelText || name.toUpperCase(),
      name,
      className: `fld-${name} form-control ${classname || className || ''}`.trim(),
    }

    if (multiple) {
      selectAttrs.multiple = true
    }

    const label = `<label for="${selectAttrs.id}">${i18n[name]}</label>`

    Object.keys(restData).forEach(function(attr) {
      selectAttrs[attr] = restData[attr]
    })

    const select = m('select', optis, selectAttrs).outerHTML
    const inputWrap = `<div class="input-wrap">${select}</div>`
    return `<div class="form-group ${name}-wrap">${label}${inputWrap}</div>`
  }

  // Append the new field to the editor
  const appendNewField = function(values, isNew = true) {
    data.lastID = h.incrementId(data.lastID)
    //if (isNew) values.uid = data.lastID

    const type = values.type || 'text'
    let label = values.label || (isNew ? i18n.get(type) || mi18n.get('label') : '')
    if (type === 'hidden') {
      label = `${mi18n.get(type)}: ${values.name}`
    }
    const disabledFieldButtons = opts.disabledFieldButtons[type] || values.disabledFieldButtons
    let fieldButtons = [
      m('a', null, {
        type: 'remove',
        id: 'del_' + data.lastID,
        className: `del-button btn ${css_prefix_text}cancel delete-confirm`,
        title: mi18n.get('removeMessage'),
      }),
      m('a', null, {
        type: 'edit',
        id: data.lastID + '-edit',
        className: `toggle-form btn ${css_prefix_text}pencil`,
        title: mi18n.get('hide'),
      }),
      m('a', null, {
        type: 'copy',
        id: data.lastID + '-copy',
        className: `copy-button btn ${css_prefix_text}copy`,
        title: mi18n.get('copyButtonTooltip'),
      }),
    ]

    if (disabledFieldButtons && Array.isArray(disabledFieldButtons)) {
      fieldButtons = fieldButtons.filter(btnData => !disabledFieldButtons.includes(btnData.type))
    }

    const liContents = [m('div', fieldButtons, { className: 'field-actions' })]

    liContents.push(
      m('label', parsedHtml(label), {
        className: 'field-label',
        id: `id-${data.lastID}-field-label`
      }),
    )

    liContents.push(
      m('span', ' *', {
        className: 'required-asterisk',
        style: values.required ? 'display:inline' : '',
      }),
    )

    // add the help icon
    const descAttrs = {
      className: 'tooltip-element',
      tooltip: values.description,
      style: values.description ? 'display:inline-block' : 'display:none',
    }
    liContents.push(m('span', '?', descAttrs))

    liContents.push(m('div', '', { className: 'prev-holder' }))
    const formElements = m('div', [advFields(values), m('a', mi18n.get('close'), { className: 'close-field' })], {
      className: 'form-elements',
    })

    const editPanel = m('div', formElements, {
      id: `${data.lastID}-holder`,
      className: 'frm-holder',
      dataFieldId: data.lastID,
    })

    formBuilder.currentEditPanel = editPanel

    liContents.push(editPanel)

    const field = m('li', liContents, {
      class: `${type}-field form-field`,
      type: type,
      id: data.lastID
    })
    const $li = $(field)

    $li.data('fieldData', { attrs: values })

    if (typeof h.stopIndex !== 'undefined') {
      $('> li', d.stage).eq(h.stopIndex).before($li)
    } else {
      $stage.append($li)
    }

    $('.sortable-options', $li).sortable({ update: () => h.updatePreview($li) })

    // generate the control, insert it into the list item & add it to the stage
    h.updatePreview($li)

    if (opts.typeUserEvents[type] && opts.typeUserEvents[type].onadd) {
      opts.typeUserEvents[type].onadd(field)
    }

    if (isNew) {
      if (opts.editOnAdd) {
        h.closeAllEdit()
        h.toggleEdit(data.lastID, false)
      }
      if (field.scrollIntoView && opts.scrollToFieldOnAdd) {
        field.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const cloneItem = function cloneItem(currentItem) {
    data.lastID = h.incrementId(data.lastID)
    const currentId = currentItem.attr('id')
    const type = currentItem.attr('type')
    const ts = new Date().getTime()
    const cloneName = type + '-' + ts
    const $clone = currentItem.clone()

    $('.fld-name', $clone).val(cloneName)
    $clone.find('[id]').each((i, elem) => {
      elem.id = elem.id.replace(currentId, data.lastID)
    })
    $clone.find('[for]').each((index, elem) => {
      const curId = elem.getAttribute('for')
      const newForId = curId.replace(currentId, data.lastID)
      elem.setAttribute('for', newForId)
    })

    $clone.attr('id', data.lastID)
    $clone.attr('name', cloneName)
    $clone.addClass('cloned')
    $('.sortable-options', $clone).sortable()

    if (opts.typeUserEvents[type] && opts.typeUserEvents[type].onclone) {
      opts.typeUserEvents[type].onclone($clone[0])
    }

    return $clone
  }



  

  // ---------------------- Event listeners ---------------------- //
  $stage.on('never-happen', 'input', () => {
    formBuilder.getFieldsAvailableForConditions()
  })

  const saveAndUpdate = evt => {
    if (evt) {
      const isDisabled = [({ type, target }) => type === 'keyup' && target.name === 'className'].some(typeCondition =>
        typeCondition(evt),
      )
      if (isDisabled) {
        return false
      }

      h.updatePreview($(evt.target).closest('.form-field'))
      h.save.call(h)
    }
  }

  const previewSelectors = ['.form-elements input', '.form-elements select', '.form-elements textarea'].join(', ')

  // Save field on change
  $stage.on('change blur keyup click', previewSelectors, throttle(saveAndUpdate, DEFAULT_TIMEOUT, { leading: false }))

  // delete options
  $stage.on('click touchstart', '.remove', e => {
    const $field = $(e.target).parents('.form-field:eq(0)')
    const field = $field[0]
    const type = field.getAttribute('type')
    const $option = $(e.target.parentElement)
    e.preventDefault()
    const options = $option.parent() //field.querySelector('.sortable-options')
    const optionsCount = options.children().length //options.childNodes.length
    if (optionsCount <= 2 && !type.includes('checkbox')) {
      opts.notify.error('Error: ' + mi18n.get('minOptionMessage'))
    } else {
      $option.slideUp('250', () => {
        $option.remove()
        h.updatePreview($field)
        h.save.call(h)
      })
    }
  })

  // touch focus
  $stage.on('touchstart', 'input', e => {
    const $input = $(this)
    if (e.handled !== true) {
      if ($input.attr('type') === 'checkbox') {
        $input.trigger('click')
      } else {
        $input.focus()
        const fieldVal = $input.val()
        $input.val(fieldVal)
      }
    } else {
      return false
    }
  })

  // toggle fields
  $stage.on('click touchstart', '.toggle-form, .close-field', function(e) {
    e.stopPropagation()
    e.preventDefault()
    if (e.handled !== true) {
      const targetID = $(e.target).parents('.form-field:eq(0)').attr('id')
      h.toggleEdit(targetID)
      e.handled = true
    } else {
      return false
    }
  })

  $stage.on('dblclick', 'li.form-field', e => {
    if (['select', 'input', 'label'].includes(e.target.tagName.toLowerCase()) || e.target.contentEditable === 'true') {
      return
    }
    e.stopPropagation()
    e.preventDefault()
    if (e.handled !== true) {
      const targetID =
        e.target.tagName == 'li' ? $(e.target).attr('id') : $(e.target).closest('li.form-field').attr('id')
      h.toggleEdit(targetID)
      e.handled = true
    }
  })

  $stage.on('change', '[name="subtype"]', e => {
    const $field = $(e.target).closest('li.form-field')
    const $valWrap = $('.value-wrap', $field)
    $valWrap.toggle(e.target.value !== 'quill')
  })

  const stageOnChangeSelectors = ['.prev-holder input', '.prev-holder select', '.prev-holder textarea']
  $stage.on('change', stageOnChangeSelectors.join(', '), e => {
    let prevOptions
    if (e.target.classList.contains('other-option')) {
      return
    }
    const field = closest(e.target, '.form-field')
    const optionTypes = ['select', 'checkbox-group', 'radio-group']
    if (optionTypes.includes(field.type)) {
      const options = field.getElementsByClassName('option-value')
      if (field.type === 'select') {
        forEach(options, i => {
          const selectedOption = options[i].parentElement.childNodes[0]
          selectedOption.checked = e.target.value === options[i].value
        })
      } else {
        prevOptions = document.getElementsByName(e.target.name)
        forEach(prevOptions, i => {
          const selectedOption = options[i].parentElement.childNodes[0]
          selectedOption.checked = prevOptions[i].checked
        })
      }
    } else {
      const fieldVal = document.getElementById('value-' + field.id)
      if (fieldVal) {
        fieldVal.value = e.target.value
      }
    }

    h.save.call(h)
  })

  // update preview to label
  addEventListeners(d.stage, 'keyup change', ({ target }) => {
    if (!target.classList.contains('fld-label')) return
    const value = target.value || target.innerHTML
    const field =closest(target, '.form-field')
    const label = field.querySelector('.field-label')
    label.innerHTML = parsedHtml(value)
    events.fieldLabelChanged.field = field
    events.fieldLabelChanged.fldLabel = label
    document.dispatchEvent(events.fieldLabelChanged)
  })

  // remove error styling when users tries to correct mistake
  $stage.on('keyup', 'input.error', ({ target }) => $(target).removeClass('error'))

  // update preview for description
  $stage.on('keyup', 'input[name="description"]', function(e) {
    const $field = $(e.target).parents('.form-field:eq(0)')
    const closestToolTip = $('.tooltip-element', $field)
    const ttVal = $(e.target).val()
    if (ttVal !== '') {
      if (!closestToolTip.length) {
        const tt = `<span class="tooltip-element" tooltip="${ttVal}">?</span>`
        $('.field-label', $field).after(tt)
      } else {
        closestToolTip.attr('tooltip', ttVal).css('display', 'inline-block')
      }
    } else {
      if (closestToolTip.length) {
        closestToolTip.css('display', 'none')
      }
    }
  })

  /**
   * Toggle multiple select options
   * @param  {Object} e click event
   * @return {String} newType
   */
  $stage.on('change', '.fld-multiple', e => {
    const newType = e.target.checked ? 'checkbox' : 'radio'
    const $options = $('.option-selected', $(e.target).closest('.form-elements'))
    $options.each(i => ($options[i].type = newType))
    return newType
  })

  // format name attribute
  $stage.on('blur', 'input.fld-name', function(e) {
    e.target.value = safename(e.target.value)
    if (e.target.value === '') {
      $(e.target).addClass('field-error').attr('placeholder', mi18n.get('cannotBeEmpty'))
    } else {
      $(e.target).removeClass('field-error')
    }
  })

  $stage.on('blur', 'input.fld-maxlength', e => {
    e.target.value = forceNumber(e.target.value)
  })

  // Copy field
  $stage.on('click touchstart', `.${css_prefix_text}copy`, function(evt) {
    evt.preventDefault()
    const currentItem = $(evt.target).parent().parent('li')
    const $clone = cloneItem(currentItem)
    $clone.insertAfter(currentItem)
    h.updatePreview($clone)
    h.save.call(h)
  })

  // Delete field
  $stage.on('click touchstart', '.delete-confirm', e => {
    e.preventDefault()

    const buttonPosition = e.target.getBoundingClientRect()
    const bodyRect = document.body.getBoundingClientRect()
    const coords = {
      pageX: buttonPosition.left + buttonPosition.width / 2,
      pageY: buttonPosition.top - bodyRect.top - 12,
    }

    const deleteID = $(e.target).parents('.form-field:eq(0)').attr('id')
    const $field = $(document.getElementById(deleteID))

    document.addEventListener(
      'modalClosed',
      function() {
        $field.removeClass('deleting')
      },
      false,
    )

    // Check if user is sure they want to remove the field
    if (opts.fieldRemoveWarn) {
      const warnH3 = m('h3', mi18n.get('warning'))
      const warnMessage = m('p', mi18n.get('fieldRemoveWarning'))
      h.confirm([warnH3, warnMessage], () => h.removeField(deleteID), coords)
      $field.addClass('deleting')
    } else {
      h.removeField(deleteID)
    }
  })

  // Update button style selection
  $stage.on('click', '.style-wrap button', e => {
    const $button = $(e.target)
    const $attrsWrap = $button.closest('.form-elements')
    const styleVal = $button.val()
    const $btnStyle = $('.btn-style', $attrsWrap)
    $btnStyle.val(styleVal)
    $button.siblings('.btn').removeClass('selected')
    $button.addClass('selected')
    h.updatePreview($btnStyle.closest('.form-field'))
    h.save()
  })

  // Attach a callback to toggle required asterisk
  $stage.on('click', '.fld-required', e => {
    $(e.target).closest('.form-field').find('.required-asterisk').toggle()
  })

  // Attach a callback to toggle roles visibility
  $stage.on('click', 'input.fld-access', function(e) {
    const roles = $(e.target).closest('.form-field').find('.available-roles')
    const enableRolesCB = $(e.target)
    roles.slideToggle(250, function() {
      if (!enableRolesCB.is(':checked')) {
        $('input[type=checkbox]', roles).removeAttr('checked')
      }
    })
  })

  // Attach a callback to add new options
  $stage.on('click', '.add-opt', function(e) {
    e.preventDefault()
    const type = $(e.target).closest('.form-field').attr('type')
    const $optionWrap = $(e.target).closest('.field-options')
    const $multiple = $('[name="multiple"]', $optionWrap)
    const $firstOption = $('.option-selected:eq(0)', $optionWrap)
    let isMultiple = false

    if ($multiple.length) {
      isMultiple = $multiple.prop('checked')
    } else {
      isMultiple = $firstOption.attr('type') === 'checkbox'
    }

    const optionTemplate = { selected: false, label: '', value: '' }
    const $sortableOptions = $('.sortable-options', $optionWrap)
    const optionData = config.opts.onAddOption(optionTemplate, {type, index: $sortableOptions.children().length, isMultiple})

    const controlClass = controls.getClass(type)
    const context = { data: data, mi18n: mi18n, stage: $stage, opts: opts, helper: h, controls: controls, controlClass: controlClass }
    const selectFieldOptions = new optionsAttribute(context, {}).selectFieldOptions(optionData, isMultiple)

    $sortableOptions.append(selectFieldOptions)
  })

  $stage.on('mouseover mouseout', '.remove, .del-button', e => $(e.target).closest('li').toggleClass('delete'))

  loadFields()

  if (opts.disableInjectedStyle) {
    const styleTags = document.getElementsByClassName('formBuilder-injected-style')
    forEach(styleTags, i => remove(styleTags[i]))
  }

  document.dispatchEvent(events.loaded)

  // Make actions accessible
  formBuilder.actions = {
    getFieldTypes: activeOnly =>
      activeOnly ? subtract(controls.getRegistered(), opts.disableFields) : controls.getRegistered(),
    clearFields: animate => h.removeAllFields(d.stage, animate),
    showData: h.showData.bind(h),
    save: minify => {
      h.save(minify)
      config.opts.onSave(h.getFormData())
    },
    addField: (field, index) => {
      h.stopIndex = data.formData.length ? index : undefined
      prepFieldVars(field)
    },
    removeField: h.removeField.bind(h),
    getData: h.getFormData.bind(h),
    setData: formData => {
      h.stopIndex = undefined
      h.removeAllFields(d.stage, false)
      loadFields(formData)
    },
    setLang: locale => {
      mi18n.setCurrent.call(mi18n, locale).then(() => {
        d.stage.dataset.content = mi18n.get('getStarted')
        controls.init()
        d.empty(d.formActions)
        h.formActionButtons().forEach(button => d.formActions.appendChild(button))
      })
    },
    toggleFieldEdit: fieldId => {
      const fieldIds = Array.isArray(fieldId) ? fieldId : [fieldId]
      fieldIds.forEach(fId => {
        if (!['number', 'string'].includes(typeof fId)) {
          return
        }
        if (typeof fId === 'number') {
          fId = d.stage.children[fId].id
        } else if (!/^frmb-/.test(fId)) {
          fId = d.stage.querySelector(fId).id
        }
        h.toggleEdit(fId)
      })
    },
    toggleAllFieldEdit: () => {
      forEach(d.stage.children, index => {
        h.toggleEdit(d.stage.children[index].id)
      })
    },
    closeAllFieldEdit: h.closeAllEdit.bind(h),
    getCurrentFieldId: () => {
      return data.lastID
    },
  }

  // set min-height on stage onRender
  d.onRender(d.controls, () => {
    // Ensure style has loaded
    const onRenderTimeout = setTimeout(() => {
      d.stage.style.minHeight = `${d.controls.clientHeight}px`
      // If option set, controls will remain in view in editor
      if (opts.stickyControls.enable) {
        h.stickyControls($stage)
      }
      clearTimeout(onRenderTimeout)
    }, 0)
  })

  return formBuilder
}

const methods = {
  init: (options, elems) => {
    const { i18n, ...opts } = jQuery.extend({}, defaultOptions, options, true)
    config.opts = opts
    const i18nOpts = jQuery.extend({}, defaultI18n, i18n, true)
    methods.instance = {
      actions: {
        getFieldTypes: null,
        addField: null,
        clearFields: null,
        closeAllFieldEdit: null,
        getData: null,
        removeField: null,
        save: null,
        setData: null,
        setLang: null,
        showData: null,
        toggleAllFieldEdit: null,
        toggleFieldEdit: null,
        getCurrentFieldId: null,
      },
      get formData() {
        return methods.instance.actions.getData && methods.instance.actions.getData('json')
      },
      promise: new Promise(function(resolve, reject) {
        mi18n
          .init(i18nOpts)
          .then(() => {
            elems.each(i => {
              const formBuilder = new FormBuilder(opts, elems[i], jQuery)
              jQuery(elems[i]).data('formBuilder', formBuilder)
              Object.assign(methods, formBuilder.actions)
              methods.instance.actions = formBuilder.actions
            })
            delete methods.instance.promise
            resolve(methods.instance)
          })
          .catch(err => {
            reject(err)
            opts.notify.error(err)
          })
      }),
    }

    return methods.instance
  },
}

jQuery.fn.formBuilder = function(methodOrOptions = {}, ...args) {
  const isMethod = typeof methodOrOptions === 'string'
  if (isMethod) {
    if (methods[methodOrOptions]) {
      if (typeof methods[methodOrOptions] === 'function') {
        return methods[methodOrOptions].apply(this, args)
      }
      return methods[methodOrOptions]
    }
  } else {
    const instance = methods.init(methodOrOptions, this)
    Object.assign(methods, instance)
    return instance
  }
}
