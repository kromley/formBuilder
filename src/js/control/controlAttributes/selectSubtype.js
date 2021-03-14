import { markup, capitalize, trimObj } from '../../utils'
import { config } from '../../config'

const m = markup
/**
 * selectSubtype creates DOM for editing selection of subtypes
 */
export default class selectSubtype {
    /**
     * initialise the attribute
     */
    constructor(context, values) {
        this.data = context.data
        this.mi18n = context.mi18n
        this.name = 'subtype'
        this.values = values
        this.stage = context.stage
        this.opts = context.opts
    }

    getDomDisplay(isHidden = false) {
        const data = this.data
        const attribute = this.name
        const values = this.values
        const mi18n = this.mi18n

        const { type } = values
        const optionData = config.subtypes[type]
        const i18n = mi18n.current

        const selectOptions = optionData.map((option, i) => {
            let optionAttrs = Object.assign(
              {
                label: `${i18n.option} ${i}`,
                value: undefined,
              },
              option,
            )
            if (option.value === values[attribute]) {
              optionAttrs.selected = true
            }
            optionAttrs = trimObj(optionAttrs)
            return m('option', optionAttrs.label, optionAttrs)
        })
        const selectAttrs = {
            id: attribute + '-' + data.lastID,
            name: attribute,
            className: `fld-${attribute} form-control`,
        }
        const labelText = mi18n.get(attribute) || capitalize(attribute) || ''
        const label = m('label', labelText, { for: selectAttrs.id })
        const select = m('select', selectOptions, selectAttrs)
        const inputWrap = m('div', select, { className: 'input-wrap' })

        const divAttrs = {
            className: `form-group ${selectAttrs.name}-wrap`
        }
        if (isHidden) {
            divAttrs.style = 'display: none'
        }
        const attrWrap = m('div', [label, inputWrap], divAttrs)
        return attrWrap.outerHTML
    }
}