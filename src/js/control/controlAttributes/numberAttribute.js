import { markup, trimObj } from '../../utils'
//import { config } from '../../config'

const m = markup
/**
 * numberAttribute creates DOM for editing nubmers 
 */
export default class numberAttribute {
    /**
     * initialise the attribute
     */
    constructor(context, values) {
        const { type } = values
        this.data = context.data
        this.mi18n = context.mi18n
        this.name = type
        this.values = values
        this.stage = context.stage
        this.opts = context.opts
    }

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
    
        const divAttrs = {
            className: `form-group ${attribute}-wrap`,
        }
        if (isHidden) {
            divAttrs.style = 'display: none'
        }

        return m('div', [inputLabel, inputWrap], divAttrs).outerHTML
    }
}