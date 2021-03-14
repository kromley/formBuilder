import { markup } from '../../utils'
import { styles } from '../../config'

const m = markup
/**
 * styleAttribute creates DOM for editing style
 */
export default class buttonStyleAttribute {
    /**
     * initialise the attribute
     */
    constructor(context, values) {
        this.data = context.data
        this.mi18n = context.mi18n
        this.name = 'style'
        this.values = values
        this.stage = context.stage
        this.opts = context.opts
    }

    getDomDisplay(isHidden = false) {
        //const attribute = this.name
        const values = this.values
        const mi18n = this.mi18n

        let style = values.style
        const i18n = mi18n.current

        let styleField = ''

        // corrects issue where 'undefined' was saved to formData
        if (style === 'undefined') {
          style = 'default'
        }
    
        const styleLabel = `<label>${i18n.style}</label>`
        styleField += m('input', null, {
          value: style || 'default',
          type: 'hidden',
          className: 'btn-style',
        }).outerHTML
        styleField += '<div class="btn-group" role="group">'
    
        styles.btn.forEach(btnStyle => {
          const classList = ['btn-xs', 'btn', `btn-${btnStyle}`]
          if (style === btnStyle) {
            classList.push('selected')
          }
          const btn = m('button', mi18n.get(`styles.btn.${btnStyle}`), {
            value: btnStyle,
            type: 'button',
            className: classList.join(' '),
          }).outerHTML
    
          styleField += btn
        })
    
        styleField += '</div>'
    
        const divAttrs = {
            className: 'form-group style-wrap',
        }
        if (isHidden) {
            divAttrs.style = 'display: none'
        }

        styleField = m('div', [styleLabel, styleField], divAttrs)
    
        return styleField.outerHTML
    
    }
}