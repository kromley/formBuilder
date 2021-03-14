import textAttribute from './textAttribute'
import { markup, parsedHtml } from '../../utils'

const m = markup

/*** label text attribute */
 export class labelText extends textAttribute {

    constructor(context, values) {
        super(context, 'label', values)
    }

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
        return this.getDomDisplayBase(isHidden, attrVal, attrLabel, this.getInnerAttrValueForLabel.bind(this))
    }

    getInnerAttrValueForLabel(inputConfig, attrVal) {
        if (!this.opts.disableHTMLLabels) {
            inputConfig.contenteditable = true
            return m('div', attrVal, inputConfig).outerHTML
        }
        return this.getInnerAttrValueBase(inputConfig, attrVal)
    }
 }

/*** description text attribute */
 export class descriptionText extends textAttribute {
    constructor(context, values) {
        super(context, 'description', values)
    }
 }
/*** placeholder text attribute */
export class placeholderText extends textAttribute {
    constructor(context, values) {
        super(context, 'placeholder', values)
    }
 }

 /*** name text attribute */
export class nameText extends textAttribute {
    constructor(context, values) {
        super(context,  'name', values)
    }
 }

 /*** className text attribute */
 export class classNameText extends textAttribute {
    constructor(context, values) {
        super(context,  'className', values)
    }
 }

/*** value test attribute */
export class valueText extends textAttribute {

    constructor(context, values) {
        super(context,  'value', values)
    }

    getDomDisplay(isHidden = false ) {
        const attrVal = this.getAttrValBase()
        const attrLabel = this.getAttrLabelBase()

        if (!isHidden) {
            if (this.values.subtype && this.values.subtype === 'quill')
                isHidden = true
        }

        return this.getDomDisplayBase(isHidden, attrVal, attrLabel, this.getInnerAttrValueBase)
    }
 }
