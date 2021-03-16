import { markup } from '../../utils'
import boolAttribute from './boolAttribute'
import { addEventListeners } from '../../utils'
import events from '../../events'

const m = markup
/**
 * contingentOnCondition creates DOM for editing condition for which field is displayed
 */
export default class contingentOnCondition extends boolAttribute {

  constructor(context, name, values) {
    super(context, name, values)
    contingentOnCondition.initializeEventListeners(context.stage, context.helper)
  }

  static hasClassBeenInitialized = false;
  static helper
  static initializeEventListeners($stage, helperIn)
  {
    if (this.hasClassBeenInitialized)
      return

    contingentOnCondition.helper = helperIn

      //show/hide dialog on main boolean changing
    $stage.on('click', 'input.fld-contingentOnCondition', contingentOnCondition.handleUseConditionCheckboxClicked)
    $stage.on('change', 'select.cond-col-1', contingentOnCondition.handleConditionalFieldSelectionChanged)

    addEventListeners(document, events.fieldLabelChanged.type, contingentOnCondition.handleFieldNameChanged)

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
    
    const formData = contingentOnCondition.helper.getFormData()
    const fieldSelected = $selectFieldForCondition.val()
    const indexField = contingentOnCondition.findFieldIndexByName(fieldSelected, formData)

    const options = contingentOnCondition.getOptionValues(formData[indexField].values, -1)
    $selectForValue.empty().append(options)
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

  getDomDisplay(isHidden = false) {
      const data = this.data
      const mi18n = this.mi18n

      const dataForm = data.formData
      let fields = dataForm 
      if (!Array.isArray(fields)) {
        fields = (dataForm) ? JSON.parse(dataForm) : []
      }
  
      const conditionalFields = this.getFieldsAvailableForConditions()
  
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
      const conditionExt = conditionsExt[0]
      const conditionLine = this.getConditionLine(conditionExt, i, conditionalFields)
      conditions.push(conditionLine)
    }

    const conditionBlock = m('ol', conditions, { className: 'define-conditions'})
     
    const wrapAttrs = { className: 'define-condition-wrap' }
    if ( values.contingentOnCondition ) wrapAttrs.style = 'display:inline-block'
    const definConditionWrap = m('div', [conditionBlock, conditionActions], wrapAttrs)

    return definConditionWrap //.outerHTML
  }

  getConditionLine(condition, indexCondition, conditionalFields) {
    const mi18n = this.mi18n
    const values = this.values

    const selectFieldName = 'condition-field-' + indexCondition + '-' + values.name
    const selectFieldValueName = 'condition-field-value-' + indexCondition + '-' + values.name

    const fieldOptions = []
    for (let i=0; i<conditionalFields.length; i++) {
      const fieldAttrs = {
        value: conditionalFields[i].name
      } 
      if (i == condition.iFieldSelected) fieldAttrs.selected = 'true'
      fieldOptions.push(m('option', conditionalFields[i].label, fieldAttrs))
    }
    const select1 = m('select', fieldOptions, 
      { id: selectFieldName, name: selectFieldName, className: 'formControl cond-col-1', access: 'true', type: 'form-field' })

    const valueOptions = contingentOnCondition.getOptionValues(condition.options, condition.iValueSelected)
    const select2 = m('select', valueOptions, 
    { id: selectFieldValueName, name: selectFieldValueName, className: 'formControl cond-col-2', access: 'true', type: 'field-value' })

    const removeLink = m('a', null, { className: ' rmove btn formbuilder-icon-cancel', title: mi18n.get('conditionRemoveTitle')})

    const conditionLineElem = [ select1, select2, removeLink]
    const conditionLine = [m('li', conditionLineElem, { className: 'ui-sortable-handle' })]
    return conditionLine
  }

  static getOptionValues(options, iValueSelected)
  {
    const valueOptions = []
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
    const labelOr = mi18n.get('conditionOperatorOr')
    const labelOption = mi18n.get('conditionalJoinBy')

    const groupName = 'condition-choice-' + values.name

    const radioGroupElems = [
      m('label', labelOption, { className: 'formbuilder-radio-group-label cond-col-3', for: groupName }),
      this.getJoinByRadioGroupOption(groupName, 1, labelAnd, 'all'),
      this.getJoinByRadioGroupOption(groupName, 2, labelOr, 'any'),
    ]
    return m('div', radioGroupElems, { className: 'radio-group header-label', style: (showJoinOption) ? 'display:block' : 'display:none'}) //.outerHTML
  }

  getJoinByRadioGroupOption(groupName, optionNum, optionLabel, optionValue) {
    const radioId = groupName + '-opt' + optionNum 

    const radioAttrs = {
      id: radioId,
      type: 'radio',
      name: groupName,
      value: optionValue 
    }

    const joinByChoice = [
      m('input', null, radioAttrs),
      m('label', optionLabel, { for: radioId})
    ]
    return m('div', joinByChoice, { className: 'formbuilder-radio-inline'}) //.outerHTML
  } 

  getFieldsAvailableForConditions() {
    const h = this.h
    const controls = this.controls

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


  