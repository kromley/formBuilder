import textAttribute from './textAttribute'
import { markup, parsedHtml } from '../../utils'

const m = markup

/*** label text attribute */
 export class labelText extends textAttribute {

    getDomDisplay(isHidden = false) {
        let attrVal = this.getAttrLabelBase()
        let attrLabel = this.getAttrLabelBase()

        const textArea = ['paragraph']
        if (textArea.includes(this.values.type)) {
            attrLabel = this.mi18n.get('content')
        } 
        else {
            attrVal = parsedHtml(attrVal)
        }
        return this.getDomDisplayForText(isHidden, attrVal, attrLabel, this.getInnerAttrValueForLabel.bind(this))
    }

    getInnerAttrValueForLabel(inputConfig, attrVal) {
        if (!this.opts.disableHTMLLabels) {
            inputConfig.contenteditable = true
            return m('div', attrVal, inputConfig).outerHTML
        }
        return this.getInnerAttrValueBase(inputConfig, attrVal)
    }
 }

/*** value test attribute */
export class valueText extends textAttribute {

    getDomDisplay(isHidden = false ) {
        const attrVal = this.getAttrValBase()
        const attrLabel = this.getAttrLabelBase()

        if (!isHidden) {
            if (this.values.subtype && this.values.subtype === 'quill')
                isHidden = true
        }

        return this.getDomDisplayForText(isHidden, attrVal, attrLabel, this.getInnerAttrValueBase)
    }
 }
