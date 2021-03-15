import { markup, attrString } from '../../utils'
import baseAttributeClass from './baseAttributeClass'

const m = markup
/**
 * BoolAttribute creates DOM for editing boolean field values
 */
export default class textAttribute extends baseAttributeClass {

    getDomDisplay(isHidden = false ) {
        const attrVal = this.getAttrValBase()
        const attrLabel = this.getAttrLabelBase()
        return this.getDomDisplayForText(isHidden, attrVal, attrLabel, this.getInnerAttrValueBase.bind(this))
    }

    getAttrValBase() {
        const attrVal = this.values[this.name] || ''
        return attrVal
    }

    getAttrLabelBase() {
        const attrLabel = this.mi18n.get(this.name)
        return attrLabel
    }

    getInnerAttrValueBase(inputConfig, attrVal) {
        inputConfig.value = attrVal
        inputConfig.type = 'text'
        return `<input ${attrString(inputConfig)}>`
    }

    getDomDisplayForText(isHidden, attrVal, attrLabel, getInnerAttrValueFunc) {
        const data = this.data
        const attribute = this.name
        const mi18n = this.mi18n
    
        const placeholder = mi18n.get(`placeholders.${attribute}`) || ''
    
        const inputConfig = {
            name: attribute,
            placeholder,
            className: `fld-${attribute} form-control`,
            id: `${attribute}-${data.lastID}`,
        }
        const attributeLabel = m('label', attrLabel, {
            for: inputConfig.id,
        }).outerHTML
        let attributefield = getInnerAttrValueFunc(inputConfig, attrVal)

        const inputWrap = `<div class="input-wrap">${attributefield}</div>`

        const visibility = isHidden ? 'none' : 'block'
        attributefield = m('div', [attributeLabel, inputWrap], {
            className: `form-group ${attribute}-wrap`,
            style: `display: ${visibility}`,
        })
    
        return attributefield.outerHTML
    }
}


  