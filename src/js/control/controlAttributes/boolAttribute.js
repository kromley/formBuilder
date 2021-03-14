import { markup } from '../../utils'

const m = markup
/**
 * BoolAttribute creates DOM for editing boolean field values
 */
export default class boolAttribute {
    /**
     * initialise the attribute
     */
     constructor(context, name, values) {
        this.data = context.data
        this.mi18n = context.mi18n
        this.name = name
        this.values = values
        this.stage = context.stage
        this.opts = context.opts
        this.controlClass = context.controlClass
    }

    getDomDisplay(isHidden = false) {
        const labels = {
            first:  this.mi18n.get(this.name),
          }
        return this.getDomDisplayBase(labels, isHidden)
    }

    getDomDisplayBase(labels, isHidden) {
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
    
        const divAttrs = {
            className: `form-group ${name}-wrap`
        }
        if (isHidden) {
            divAttrs.style = 'display: none'
        }

        return m('div', left.concat(right), divAttrs).outerHTML
    }
}


  