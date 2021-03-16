import textAttribute from './textAttribute'
import { markup, closest, parsedHtml, addEventListeners } from '../../utils'
import events from '../../events'

const m = markup

/*** label text attribute */
 export class labelText extends textAttribute {

    constructor(context, name, values) {
        super(context, name, values)
        labelText.initializeEventListeners(context.stage)
    }

    static hasClassBeenInitialized = false;
    static initializeEventListeners() //$stage)
    {
      if (this.hasClassBeenInitialized)
        return
  
      //allows other object to know label has changed
      addEventListeners(document, 'keyup change', ({ target }) => {
        if (target.classList.contains('fld-label')) {
          const value = target.value || target.innerHTML
          const field = closest(target, '.form-field')
          const label = field.querySelector('.field-label')
          label.innerHTML = parsedHtml(value)
          events.fieldLabelChanged.field = field
          events.fieldLabelChanged.fldLabel = label
          document.dispatchEvent(events.fieldLabelChanged)
        }
      })
    
      this.hasClassBeenInitialized = true
    }
  
    
    getDomDisplay(isHidden = false) {
        let attrVal = this.getAttrValBase()
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
