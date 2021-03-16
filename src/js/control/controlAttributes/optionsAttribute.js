import { markup, hyphenCase, getContentType, closest, addEventListeners } from '../../utils'
import { config } from '../../config'
import { css_prefix_text } from '../../../fonts/config.json'
import baseAttributeClass from './baseAttributeClass'
import events from '../../events'

const m = markup
const b = baseAttributeClass
/**
 * Add data for field with options [select, checkbox-group, radio-group]
 */
export default class optionsAttribute extends baseAttributeClass {

  constructor(context, name, values) {
    super(context, name, values)
    optionsAttribute.initializeEventListeners(context)
  }

  static hasClassBeenInitialized = false;
  static initialContext = null
  static initializeEventListeners(context)
  {
    if (this.hasClassBeenInitialized)
      return

    optionsAttribute.initialContext = context
    const $stage = context.stage

    // Attach a callback to add new options
    $stage.on('click', '.add-opt', optionsAttribute.handleAddButtonClicked)
    
    //allows other object to know field options has changed
    addEventListeners(document, 'keyup change', ({ target }) => {
      if (target.classList.contains('option-label')) {
        const field = closest(target, '.form-field')
        events.fieldOptionListChanged.field = field
        document.dispatchEvent(events.fieldOptionListChanged)
      }
    })

    this.hasClassBeenInitialized = true
  }

  static handleAddButtonClicked(e) {
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
    
    const controlClass = optionsAttribute.initialContext.controls.getClass(type)
    const context = { data: optionsAttribute.initialContext.data, 
      mi18n: optionsAttribute.initialContext.mi18n, 
      stage: optionsAttribute.initialContext.stage, 
      opts: optionsAttribute.initialContext.opts, 
      helper: optionsAttribute.initialContext.helper, 
      controls: optionsAttribute.initialContext.controls, controlClass: controlClass }
    const selectFieldOptions = new optionsAttribute(context, {}).selectFieldOptions(optionData, isMultiple)

    $sortableOptions.append(selectFieldOptions)
  }

  getDomDisplay(isHidden = false) {
      const fieldData = this.values
      const mi18n = this.mi18n
      const controlClass = this.controlClass

      const { type, values } = fieldData 

      let fieldValues
      const optionActions = [m('a', mi18n.get('addOption'), { className: 'add add-opt' })]
      const fieldOptions = [m('label', mi18n.get('selectOptions'), { className: 'false-label' })]
      const isMultiple = fieldData.multiple || type === 'checkbox-group'
      const optionDataTemplate = count => {
        const label = mi18n.get('optionCount', count)
        return {
          selected: false,
          label,
          value: hyphenCase(label)
        }
      }
  
      if (!values || !values.length) {
        let defaultOptCount = [1, 2, 3]
        if (controlClass && controlClass.getDefaultNumberOfOptionsArray) {
            defaultOptCount = controlClass.getDefaultNumberOfOptionsArray(type)
        }
        fieldValues = defaultOptCount.map(optionDataTemplate)
  
        const firstOption = fieldValues[0]
        if (firstOption.hasOwnProperty('selected')) {
          if (controlClass && controlClass.defaultFirstOptionSelectValue && controlClass.defaultFirstOptionSelectValue(type)) {
              firstOption.selected = true
          }
        }
      } else {
        // ensure option data is has all required keys
        fieldValues = values.map(option => Object.assign({}, { selected: false }, option))
      }
  
      const optionActionsWrap = m('div', optionActions, { className: 'option-actions' })
      const options = m(
        'ol',
        fieldValues.map((option, index) => {
          const optionData = config.opts.onAddOption(option, {type, index, isMultiple})
          return this.selectFieldOptions(optionData, isMultiple)}),
        {
          className: 'sortable-options',
        },
      )
      const optionsWrap = m('div', [options, optionActionsWrap], { className: 'sortable-options-wrap' })
  
      fieldOptions.push(optionsWrap)

      return m('div', fieldOptions,  b.getOuterStyleAttribs('field-options', isHidden)).outerHTML
  }

  selectFieldOptions(optionData, multipleSelect) {
      const mi18n = this.mi18n

      const optionTemplate = { selected: false, label: '', value: '' }
      const optionInputType = {
        selected: multipleSelect ? 'checkbox' : 'radio',
      }
      const optionInputTypeMap = {
        boolean: (value, prop) => {
          const attrs = {value, type: optionInputType[prop] || 'checkbox'}
          if (value) {
            attrs.checked  = !!value
          }
          return['input', null, attrs]
        },
        number: value => ['input', null, {value, type: 'number'}],
        string: (value, prop) => (['input', null, {value, type: 'text', placeholder: mi18n.get(`placeholder.${prop}`) || ''}]),
        array: values => ['select', values.map(({label, value}) => m('option', label, {value}))],
        object: ({tag, content, ...attrs}) => [tag, content, attrs],
      }
      optionData = {...optionTemplate, ...optionData}

      const optionInputs = Object.entries(optionData).map(([prop, val]) => {
        const optionInputDataType = getContentType(val)
  
        const [tag, content, attrs] = optionInputTypeMap[optionInputDataType](val, prop)
        const optionClassName = `option-${prop} option-attr`
        attrs['data-attr'] = prop
        attrs.className = attrs.className ? `${attrs.className} ${optionClassName}` : optionClassName
  
        return m(tag, content, attrs)
      })

      const removeAttrs = {
          className: `remove btn ${css_prefix_text}cancel`,
          title: mi18n.get('removeMessage'),
      }
      optionInputs.push(m('a', null, removeAttrs))
    
      return m('li', optionInputs).outerHTML
  }
}