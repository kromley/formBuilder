import { markup, trimObj } from '../../utils'
import baseAttributeClass from './baseAttributeClass'
//import { config } from '../../config'

const m = markup
const b = baseAttributeClass
/**
 * numberAttribute creates DOM for editing nubmers 
 */
export default class numberAttribute extends baseAttributeClass {
    getDomDisplay(isHidden = false) {
        const data = this.data
        const attribute = this.name
        const values = this.values
        const mi18n = this.mi18n

        const { class: classname, className, value, ...attrs } = values
        const attrVal = attrs[attribute] || value
        const attrLabel = mi18n.get(attribute) || attribute
        const placeholder = mi18n.get(`placeholder.${attribute}`)
    
        const inputConfig = {
          type: 'number',
          value: attrVal,
          name: attribute,
          placeholder,
          className: `fld-${attribute} form-control ${classname || className || ''}`.trim(),
          id: `${attribute}-${data.lastID}`,
        }
        const numberAttribute = m('input', null, trimObj(inputConfig)).outerHTML
        const inputWrap = `<div class="input-wrap">${numberAttribute}</div>`
        const inputLabel = `<label for="${inputConfig.id}">${attrLabel}</label>`
    
        return m('div', [inputLabel, inputWrap], b.getOuterStyleAttribs(attribute+'-wrap', isHidden)).outerHTML
    }
}

