import boolAttribute from './boolAttribute'
import { markup } from '../../utils'

const m = markup
/**
 * accessAttribute creates DOM for editing access roles
 */
export default class accessAttribute extends boolAttribute {
    /**
     * initialise the attribute
     */
    constructor(context, name, values) {
        super(context, name, values)
        this.roles = values.role !== undefined ? values.role.split(',') : []
    }

    getDomDisplay(isHidden = false) {
        const data = this.data
        const values = this.values
        const mi18n = this.mi18n
        const opts = this.opts
        const roles = this.roles

        const rolesDisplay = (values.role && !isHidden) ? 'style="display:block"' : ''
        const availableRoles = [`<div class="available-roles" ${rolesDisplay}>`]
        for (const key in opts.roles) {
          if (opts.roles.hasOwnProperty(key)) {
            const roleId = `fld-${data.lastID}-roles-${key}`
            const cbAttrs = {
              type: 'checkbox',
              name: 'roles[]',
              value: key,
              id: roleId,
              className: 'roles-field',
            }
            if (roles.includes(key)) {
              cbAttrs.checked = 'checked'
            }

            availableRoles.push(`<label for="${roleId}">`)
            availableRoles.push(m('input', null, cbAttrs).outerHTML)
            availableRoles.push(` ${opts.roles[key]}</label>`)
          }
        }
        availableRoles.push('</div>')
        const accessLabels = {
          first: mi18n.get('roles'),
          second: mi18n.get('limitRole'),
          content: availableRoles.join(''),
        }

        return this.getDomDisplayForBool(accessLabels, isHidden)
    }
}