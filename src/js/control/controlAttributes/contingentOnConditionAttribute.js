//import { markup } from '../../utils'
import boolAttribute from './boolAttribute'
import { addEventListeners } from '../../utils'
import events from '../../events'

//const m = markup
/**
 * contingentOnCondition creates DOM for editing condition for which field is displayed
 */
export default class contingentOnCondition extends boolAttribute {

  getDomDisplay(isHidden = false) {
      const data = this.data
      const values = this.values
      const mi18n = this.mi18n
      const $stage = this.stage

      const dataForm = data.formData
      let fields = dataForm 
      if (!Array.isArray(fields)) {
        fields = (dataForm) ? JSON.parse(dataForm) : []
      }
  
      const selectors = this.getFieldsAvailableForConditions()
  
      if (selectors.length == 0)
        return ''
  
      const labelField = mi18n.get('conditionFieldLabel')
      const labelValue = mi18n.get('conditionValueLabel')
      const labelConditionOperator = mi18n.get('conditionOperatorAnd')
    
      const pastSelectorDisplay = values.contingentOnPreviousAnswer ? 'style="display:block"' : ''
      const availablePastSelector = [`<div class="available-condition-selectors" ${pastSelectorDisplay}>`]
      availablePastSelector.push('<div class="sortable-options-wrap" style="width:98%">')
      availablePastSelector.push('<table class="sortable-options ui-sortable">')
  
      //header
      availablePastSelector.push('<thead class="condition-thead"><tr class="ui-sortable-handle">')
      availablePastSelector.push(`<th class="contigent-condition-col field-label">${labelField}</th>`)
      availablePastSelector.push(`<th class="contigent-condition-col field-label">${labelValue}</th>`)
      availablePastSelector.push('<th class="contigent-condition-col-last field-label">&nbsp;</th>')
      availablePastSelector.push('</tr></thead>')
  
      //conditions
      availablePastSelector.push('<tbody class="condition-tbody">')
      availablePastSelector.push('<tr class="ui-sortable-handle">')
      availablePastSelector.push('<td class="contigent-condition-col option-label">')
      availablePastSelector.push(`<select name="${labelField}" id="pet-select">`)

      for (const index in selectors) {
        const select = selectors[index]
        availablePastSelector.push(`<option value="${select.name}" name="option-${select.id}">${select.label}</option>`)
      }
      availablePastSelector.push('</select>')
      availablePastSelector.push('</td>')
      
  
      availablePastSelector.push(`<td class="contigent-condition-col option-label">${labelValue}</td>`)
      availablePastSelector.push(`<td class="contigent-condition-col-last option-label">
        <a class="joinOperator add-opt">${labelConditionOperator}</a></td>`)
      availablePastSelector.push('</tr>')
  
      if (!$stage.fieldLevelChange) {
        addEventListeners(document, events.fieldLabelChanged.type, e => {
          const fieldChanged = e.field
          const fieldLabel = e.fldLabel
          const selector = 'option[name=\'option-'+fieldChanged.id+'\']'
          const optionHtml = $(selector)
          if (optionHtml) {
            const newVal = fieldLabel.innerHTML
            const options = $(selector).toArray()
            for (const index in options) {
              const option = options[index]
              option.innerHTML = newVal
            }
  
            //forEach(optionHtml, index => {
            //  optionHtml[index].innerHTML = newVal
            //})
          }
        })
      }

      availablePastSelector.push('</tbody></table>')
      availablePastSelector.push('<div class="option-actions">')
      availablePastSelector.push(`<a class="add add-opt">${mi18n.get('addCondition')}</a>`)
      availablePastSelector.push('</div>')
      availablePastSelector.push('</div>')
  
      const displayInDom = this.getDomDisplayForBool({
        first: mi18n.get('contingentLabel'),
        second: mi18n.get('contingentOnConditionDesc'),
        content: availablePastSelector.join('')
      }, isHidden)
  
      //add processing
      if (!('contingentHandling' in $stage)) {
        $stage.contingentHandling = true
        $stage.on('click', 'input.fld-contingentOnCondition', function(e) {
          const selectorsInDom = $(e.target).closest('.form-field').find('.available-condition-selectors')
          const enableConditionalInclude= $(e.target)
          selectorsInDom.slideToggle(250, function() {
            if (!enableConditionalInclude.is(':checked')) {
              $('input[type=checkbox]', selectorsInDom).removeAttr('checked')
            }
          })
        })
      }
  
      return displayInDom
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


  