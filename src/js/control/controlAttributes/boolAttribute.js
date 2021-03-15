import baseAttributeClass from './baseAttributeClass'
import { markup } from '../../utils'

const m = markup
const b = baseAttributeClass
/**
 * BoolAttribute creates DOM for editing boolean field values
 */
export default class boolAttribute extends baseAttributeClass {

    getDomDisplay(isHidden = false) {
        const labels = {
            first:  this.mi18n.get(this.name),
          }
        return this.getDomDisplayForBool(labels, isHidden)
    }

    getDomDisplayForBool(labels, isHidden) {
        const data = this.data
        const name = this.name
        const values = this.values
        const label = txt =>
          m('label', txt, {
            for: `${name}-${data.lastID}`,
          }).outerHTML
        const cbAttrs = {
          type: 'checkbox',
          className: `fld-${name}`,
          name,
          id: `${name}-${data.lastID}`,
        }
        if (values[name]) {
          cbAttrs.checked = true
        }
        const left = []
        let right = [m('input', null, cbAttrs).outerHTML]
    
        if (labels.first) {
          left.push(label(labels.first))
        }
    
        if (labels.second) {
          right.push(' ', label(labels.second))
        }
        if (labels.content) {
          right.push(labels.content)
        }
    
        right = m('div', right, { className: 'input-wrap' }).outerHTML
    
        return m('div', left.concat(right), b.getOuterStyleAttribs(name+'-wrap', isHidden)).outerHTML
    }
}


  