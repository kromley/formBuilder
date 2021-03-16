import { markup } from '../../utils'
import boolAttribute from './boolAttribute'
import { addEventListeners } from '../../utils'
import events from '../../events'
//import { config } from '../../config'

const m = markup
/**
 * contingentOnCondition creates DOM for editing condition for which field is displayed
 */
export default class contingentOnCondition extends boolAttribute {

  constructor(context, name, values) {
    super(context, name, values)
    contingentOnCondition.initializeEventListeners(context)
  }

  static getDataFromFormGroup(fieldData, $wrap) {
    //const $formGroup = $(formGroup)
    const fieldDataExtra = { contingentConditions: [], contingentConditionsJoinedBy: 'all' }

    const $checkedAnyInput = $('#condition-choice-' + fieldData.name + '-opt-any:checked')
    fieldDataExtra.contingentConditionsJoinedBy = ($checkedAnyInput.length > 0) ? 'any' : 'all'

    const $defineConditions = $wrap.find('.define-conditions')
    const maxItem = $defineConditions.attr('increment')
    for (let i = 0; i < maxItem; i++) {
      const $selectField = $('#condition-field-' + i + '-' + fieldData.name)
      if (!$selectField.length) //can happen from removes
        continue
      const valueId = '#condition-field-value-' + i + '-' + fieldData.name
      const $selectValue = $(valueId)
      fieldDataExtra.contingentConditions.push({fieldName: $selectField.val(), matchValue: $selectValue.val() })
    }

    return fieldDataExtra
  }

  static hasClassBeenInitialized = false;
  static initialContext = null
  static initializeEventListeners(context)
  {
    if (this.hasClassBeenInitialized)
      return

    contingentOnCondition.initialContext = context
    const $stage = context.stage

      //show/hide dialog on main boolean changing
    $stage.on('click', 'input.fld-contingentOnCondition', contingentOnCondition.handleUseConditionCheckboxClicked)
    $stage.on('change', 'select.cond-col-1', contingentOnCondition.handleConditionalFieldSelectionChanged)
    $stage.on('click', '.add-condition', contingentOnCondition.handleAddButtonClicked)
    $stage.on('click touchstart', '.remove-cond', contingentOnCondition.handleRemoveButtonClicked)

    addEventListeners(document, events.fieldLabelChanged.type, contingentOnCondition.handleFieldNameChanged)
    addEventListeners(document, events.fieldRemoved.type, contingentOnCondition.handleFieldRemoved)
    addEventListeners(document, events.fieldOptionListChanged.type, contingentOnCondition.handleFieldOptionsChanged)

    this.hasClassBeenInitialized = true
  }

  static handleUseConditionCheckboxClicked(e) {
    const selectorsInDom = $(e.target).closest('.form-field').find('.define-condition-wrap')
    const enableConditionalInclude= $(e.target)
    selectorsInDom.slideToggle(250, function() {
      if (!enableConditionalInclude.is(':checked')) {
        $('input[type=checkbox]', selectorsInDom).removeAttr('checked')
      }
    })
  }

  static handleConditionalFieldSelectionChanged(e) {
    const $selectFieldForCondition = $(e.target)
    const idField = $selectFieldForCondition.attr('id')
    const idValue = idField.replace('condition-field','condition-field-value')
    const $selectForValue = $('#' + idValue)
    
    const formData = contingentOnCondition.initialContext.helper.getFormData()
    const fieldSelected = $selectFieldForCondition.val()
    const indexField = contingentOnCondition.findFieldIndexByName(fieldSelected, formData)

    const options = contingentOnCondition.getOptionValues(formData[indexField].values, -1)
    $selectForValue.empty().append(options)
  }

  static handleAddButtonClicked(e) {
    const h = contingentOnCondition.initialContext.helper

    e.preventDefault()
    //const type = $(e.target).closest('.form-field').attr('type')
    const $conditionWrap = $(e.target).closest('.define-condition-wrap')
    const $conditionHolder = $conditionWrap.find('ol').first()

    if ($conditionHolder.children().length < 3) {
      const $joinBy = $conditionHolder.find('div.radio-group').first()
      $joinBy.css('display', 'inline-block')
    }

    const $fieldWithCondition = $conditionWrap.closest('.form-field')
    const fieldWithConditionData = h.getAttrVals($fieldWithCondition[0])
    const name = fieldWithConditionData.name

    const conditionalFields = contingentOnCondition.getFieldsAvailableForConditions()
    const conditionExt = { 
      fieldIndex: 0, 
      options: conditionalFields[0].values, 
      selectedOption: 0 
    }

    const nextConditionIndex = parseInt($conditionHolder.attr('increment'))

    const conditionLine = contingentOnCondition.getConditionLine(name, conditionExt, nextConditionIndex, conditionalFields)
    $conditionHolder.append(conditionLine)
    $conditionHolder.attr('increment', nextConditionIndex + 1)
  }

  static handleRemoveButtonClicked(e) {
    //mostly handled by global handler in form-builder - todo: move that to base attribute type - this just fixes up joinBy
    const $defineConditions = $(e.target).parents('.define-conditions:eq(0)')
    if ($defineConditions.children('li').length < 4) {
//      $defineConditions.find('.radio-group').first().attr('style', 'display:none')
      $defineConditions.find('.radio-group').first().fadeOut(200)
    }
 
  }

  static handleFieldNameChanged(e) {
    const fieldChanged = e.field
    const name = $('#name-' + fieldChanged.id).attr('value')
    if (!name)
      return
    const fieldLabel = e.fldLabel
    const $selector = $('option[value=\''+name+'\']')
    $selector.each(function(index) {
      $selector[index].innerHTML = fieldLabel.innerHTML
    })
  }

  static handleFieldOptionsChanged(e) {
    const h = contingentOnCondition.helper
    const fieldChanged = e.field

    const name = $('#name-' + fieldChanged.id).attr('value')
    if (!name)
      return
    const $selector = $('option[value=\''+name+'\']:selected') //field selected in condition
    const formData = ($selector.length > 0) ? contingentOnCondition.helper.getFormData() : null
    $selector.each(function(index) {
      const option = $selector[index]
      const $selectFieldForCondition = $(option).closest('select')
      const idFieldChanged = $selectFieldForCondition.attr('id')
      const idValue = idFieldChanged.replace('condition-field','condition-field-value')
      const $selectForValue = $('#' + idValue)
  
      const fieldSelected = $selectFieldForCondition.val()
      const indexField = contingentOnCondition.findFieldIndexByName(fieldSelected, formData)

      const $fieldWithCondition = $selectForValue.closest('.form-field')
      const fieldWithConditionData = h.getAttrVals($fieldWithCondition[0])
      const indexFieldWithCondition = contingentOnCondition.findFieldIndexByName(fieldWithConditionData.name, formData)
      let indexSelectedOption = -1
      const conditions = formData[indexFieldWithCondition].contingentConditions
      if (conditions) {
        for (let i=0; i<conditions.length; i++) {
          const condition = conditions[i]
          if (condition.fieldName == fieldSelected) {
            indexSelectedOption = contingentOnCondition.findOptionIndexByValue(condition.matchValue, formData[indexField].values)
            break
          }
        }
      }

      const options = contingentOnCondition.getOptionValues(formData[indexField].values, indexSelectedOption)
      $selectForValue.empty().append(options)
    })
  }

  static handleFieldRemoved(e) {
    const h = contingentOnCondition.helper
    const fieldRemoved = e.field
    const fieldData = h.getAttrVals(fieldRemoved)
    //const fieldType = $(fieldRemoved).attr('type')

    const $options = $('.condition-row option[value=\'' + fieldData.name + '\']')

    $options.each(i => {
      const option = $options[i]
      const $select = $(option).parent()
      if ($select.children().length < 2) { //no fields for conditional - remove whole option
          const $formGroup = $select.closest('.contingentOnCondition-wrap')
          $formGroup.remove()
          return
      }
      if ($(option).is(':selected')) { //removed used field - make sure option no longer selected
        const $inputWrap = $select.closest('.input-wrap')
        const $input = $inputWrap.children('input').first()
        $input.prop('checked', false)
      }
      $(option).remove()
    })
  }

  getDomDisplay(isHidden = false) {
      const data = this.data
      const mi18n = this.mi18n

      const dataForm = data.formData
      let fields = dataForm 
      if (!Array.isArray(fields)) {
        fields = (dataForm) ? JSON.parse(dataForm) : []
      }
  
      const conditionalFields = contingentOnCondition.getFieldsAvailableForConditions()

      if (conditionalFields.length == 0)
        return ''
  
      const defineConditionArea = this.getDefineConditionArea(conditionalFields)
  
      const displayInDom = this.getDomDisplayForBool({
        first: mi18n.get('contingentLabel'),
        second: mi18n.get('contingentOnConditionDesc'),
        content: defineConditionArea
      }, isHidden)
  
      return displayInDom
  }

  getDefineConditionArea(conditionalFields) {
    const values = this.values
    const mi18n = this.mi18n

    if (!values.contingentConditions) {
      const fieldForCondition = conditionalFields[0]
      const firstCondition = {
         fieldName: fieldForCondition.name,
         matchValue: fieldForCondition.values[0].value
      }
      values.contingentConditions = [ firstCondition ]
      values.contingentConditionsJoinedBy = 'all'
    }
    const contigentCondition = values.contingentConditions
    const conditionsExt = this.fillOutConditionsDataBasedOnFields(contigentCondition, conditionalFields)

    const labelField = mi18n.get('conditionFieldLabel')
    const labelValue = mi18n.get('conditionValueLabel')

    const conditionActions = m('div', 
      m('a', mi18n.get('addCondition'), { className: 'add add-condition' }), 
      { className: 'condition-block-actions'})

    const conditonHeaderElems = [
      m('span', labelField, { class: 'header-label cond-col-1', type: 'form-field' } ), 
      m('span', labelValue, { class: 'header-label cond-col-2', type: 'field-value' } ),
      this.getJoinByRadioGroup(contigentCondition.length > 1),
    ] 
    const conditonHeader = [m('li', conditonHeaderElems, { className: 'ui-sortable-handle header' })]
    const conditions = [conditonHeader]

    for (let i=0; i < conditionsExt.length; i++) {
      const conditionExt = conditionsExt[i]
      const conditionLine = contingentOnCondition.getConditionLine(values.name, conditionExt, i, conditionalFields)
      conditions.push(conditionLine)
    }

    const conditionBlock = m('ol', conditions, 
      { className: 'define-conditions', increment: conditionsExt.length}
    )
     
    const wrapAttrs = { className: 'define-condition-wrap' }
    if ( values.contingentOnCondition ) wrapAttrs.style = 'display:inline-block'
    const definConditionWrap = m('div', [conditionBlock, conditionActions], wrapAttrs)

    return definConditionWrap //.outerHTML
  }

  static getConditionLine(fieldName, condition, indexCondition, conditionalFields) {
    const mi18n = contingentOnCondition.initialContext.mi18n

    const selectFieldName = 'condition-field-' + indexCondition + '-' + fieldName
    const selectFieldValueName = 'condition-field-value-' + indexCondition + '-' + fieldName

    const fieldOptions = []
    for (let i=0; i<conditionalFields.length; i++) {
      const fieldAttrs = {
        value: conditionalFields[i].name
      } 
      if (i == condition.fieldIndex) fieldAttrs.selected = 'true'
      fieldOptions.push(m('option', conditionalFields[i].label, fieldAttrs))
    }
    const select1 = m('select', fieldOptions, 
      { id: selectFieldName, name: selectFieldName, className: 'formControl cond-col-1', access: 'true', type: 'form-field' })

    const valueOptions = contingentOnCondition.getOptionValues(condition.options, condition.selectedOption)
    const select2 = m('select', valueOptions, 
    { id: selectFieldValueName, name: selectFieldValueName, className: 'formControl cond-col-2', 
      access: 'true', type: 'field-value' })

    const removeLink = m('a', null, { className: 'remove btn formbuilder-icon-cancel remove-cond', title: mi18n.get('conditionRemoveTitle')})

    const conditionLineElem = [ select1, select2, removeLink]
    const conditionLine = [m('li', conditionLineElem, { className: 'ui-sortable-handle condition-row' })]
    return conditionLine
  }

  static getOptionValues(options, iValueSelected)
  {
    const valueOptions = []
    if (options.length == 1) { //special case for one checkbox
      const boolValueAttrs = {
        value: options[0].value + '-true'
      }
      if (0 == iValueSelected) boolValueAttrs.selected = 'true'
      valueOptions.push(m('option', options[0].label + ' - true', boolValueAttrs))

      boolValueAttrs.value = options[0].value + '-false'
      if (1 == iValueSelected) boolValueAttrs.selected = 'true'
      valueOptions.push(m('option', options[0].label+ ' - false', boolValueAttrs))
      return valueOptions
    }

    for (let j=0; j< options.length; j++) {
      const valueAttrs = {
        value: options[j].value
      }
      if (j == iValueSelected) valueAttrs.selected = 'true'
      valueOptions.push(m('option', options[j].label, valueAttrs))
    }
    return valueOptions
  }

  fillOutConditionsDataBasedOnFields(conditions, conditionalFields) {
    const listConditionsExt = []

    for (let i=0; i < conditions.length; i++) {
      const condition = conditions[i]
      let iFieldSelected = contingentOnCondition.findFieldIndexByName(condition.fieldName, conditionalFields)
      let iValueSelected = 0
      if (iFieldSelected < 0) { //possibly deleted after creation
        iFieldSelected = 0
      }
      else {
        iValueSelected = contingentOnCondition.findOptionIndexByValue(condition.matchValue, conditionalFields[iFieldSelected].values)
      }
      const conditionExt = { 
        fieldIndex: iFieldSelected, 
        options: conditionalFields[iFieldSelected].values, 
        selectedOption: iValueSelected 
      }
      listConditionsExt.push(conditionExt)
    }

    return listConditionsExt
  }

  static findFieldIndexByName(name, conditionalFields) {
    for (let i=0; i < conditionalFields.length; i++) {
      const field = conditionalFields[i]
      if (field.name == name)
        return i
    }
    return -1
  }

  static findOptionIndexByValue(value, fieldOptions) {
    if (fieldOptions.length == 1) {
      if (value == fieldOptions[0].value + '-true')
        return 0
      if (value == fieldOptions[0].value + '-false')
        return 1
      return -1
    }
    for (let i=0; i < fieldOptions.length; i++) {
      const option = fieldOptions[i]
      if (option.value == value)
        return i
    }
    return -1
  }

  getJoinByRadioGroup(showJoinOption) {
    const values = this.values
    const mi18n = this.mi18n

    const labelAnd = mi18n.get('conditionOperatorAnd')
    const labelOr =  mi18n.get('conditionOperatorOr')
    const labelOption = mi18n.get('conditionalJoinBy')

    const groupName = 'condition-choice-' + values.name

    const radioGroupElems = [
      m('div', labelOption, { className: 'formbuilder-radio-group-label cond-col-3', for: groupName }),
      m('div', [
      this.getJoinByRadioGroupOption(groupName, labelAnd, 'all'),
      this.getJoinByRadioGroupOption(groupName, labelOr, 'any')], {className: 'join-by-check-wrapper'} ),
    ]
    return m('div', radioGroupElems, { className: 'radio-group header-label', style: (showJoinOption) ? 'display:block' : 'display:none'}) //.outerHTML
  }

  getJoinByRadioGroupOption(groupName, optionLabel, optionValue) {
    const values = this.values
    const radioId = groupName + '-opt-' + optionValue 

    const isSelected = (values.contingentConditionsJoinedBy == optionValue)

    const radioAttrs = {
      id: radioId,
      type: 'radio',
      name: groupName,
      value: optionValue 
    }

    if (isSelected) radioAttrs.checked = 'checked'

    const joinByChoice = [
      m('input', null, radioAttrs),
      m('label', optionLabel, { for: radioId, className: 'join-by-chk-label'})
    ]
    return m('div', joinByChoice, { className: 'formbuilder-radio-inline'}) //.outerHTML
  } 

  static getFieldsAvailableForConditions = () => {
    const h = contingentOnCondition.initialContext.helper
    const controls = contingentOnCondition.initialContext.controls

    const returnFields = []
    const allFields = h.getFormData()

    for (let i=0; i < allFields.length; i++) {
      const field = allFields[i]
      if ( $.isEmptyObject(field) )
          break
      const { type } = field
      const controlClass = controls.getClass(type)
      if (controlClass.isFieldAvailableForConditions && controlClass.isFieldAvailableForConditions(field)) {
        returnFields.push(field)
      }
    }
    return returnFields
  }
  
}


  