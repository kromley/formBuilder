import { markup, capitalize, trimObj } from '../../utils'
import { config } from '../../config'
import baseAttributeClass from './baseAttributeClass'

const m = markup
const b = baseAttributeClass
/**
 * selectSubtype creates DOM for editing selection of subtypes
 */
export default class selectSubtype extends baseAttributeClass {
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

        const attrWrap = m('div', [label, inputWrap],  b.getOuterStyleAttribs(selectAttrs.name+'-wrap', isHidden))
        return attrWrap.outerHTML
    }
}