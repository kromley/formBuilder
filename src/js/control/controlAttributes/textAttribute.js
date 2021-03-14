import { markup, attrString } from '../../utils'

const m = markup
/**
 * BoolAttribute creates DOM for editing boolean field values
 */
export default class textAttribute {
    /**
     * initialise the control object
     * @param {Object} config each control class receives a control configuration
     * object ({name, label, etc})
     * @param {Boolean} preview isPreview
     */
    constructor(context, name, values) {
        this.data = context.data
        this.mi18n = context.mi18n
        this.name = name
        this.values = values
        this.stage = context.stage
        this.opts = context.opts
    }

    getDomDisplay(isHidden = false ) {
        const attrVal = this.getAttrLabelBase()
        const attrLabel = this.getAttrLabelBase()
        return this.getDomDisplayBase(isHidden, attrVal, attrLabel, this.getInnerAttrValueBase.bind(this))
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

    getDomDisplayBase(isHidden, attrVal, attrLabel, getInnerAttrValueFunc) {
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


  