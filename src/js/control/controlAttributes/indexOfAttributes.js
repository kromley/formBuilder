import accessAttribute from './accessAttribute'
import boolAttribute from './boolAttribute'
import { inlineBoolean, multipleBoolean, otherBoolean, requireValidOptionBoolean } from './boolAttributeTypes'
import buttonStyleAttribute from './buttonStyleAttribute'
import numberAttribute from './numberAttribute'
import selectSubtype from './selectSubtype'
import textAttribute from './textAttribute'
import { labelText, valueText } from './textAttributeTypes'
import optionsAttribute from './optionsAttribute'
import contingentOnCondition from './contingentOnConditionAttribute'

/**
 * registers built in attribute classes
 */
 export default class indexOfAttributes {
     static getPredefinedAttributes = () => {
        const advFieldMap = {
            required: boolAttribute, 
            toggle: boolAttribute, 
            inline: inlineBoolean,
            label: labelText, 
            description: textAttribute, 
            subtype: selectSubtype, 
            buttonStyle: buttonStyleAttribute, 
            placeholder: textAttribute, 
            rows: numberAttribute, 
            className: textAttribute, 
            name: textAttribute, 
            value: valueText, 
            maxlength: numberAttribute, 
            min: numberAttribute, 
            max: numberAttribute, 
            step: numberAttribute, 
            access: accessAttribute, 
            other: otherBoolean, 
            options: optionsAttribute, 
            requireValidOption: requireValidOptionBoolean, 
            contingentOnCondition: contingentOnCondition, 
            multiple: multipleBoolean
        }
        return advFieldMap
    }
      
 }
