import boolAttribute from './boolAttribute'

/*** Toggle Boolean */
 export class inlineBoolean extends boolAttribute {

    getDomDisplay(isHidden = false) {
        const { type } = this.values
        const labels = {
            first: this.mi18n.get('inline'),
            second: this.mi18n.get('inlineDesc', type.replace('-group', '')),
            }
        return this.getDomDisplayForBool(labels, isHidden)
    }
 }


 /**
 * Require Valid Option Boolean 
 */
export class requireValidOptionBoolean extends boolAttribute {

    getDomDisplay(isHidden = false) {
        const labels = {
            first: ' ',
            second: this.mi18n.get('requireValidOption'),
          }
        return this.getDomDisplayForBool(labels, isHidden)
    }

}

 /**
 * Other Boolean 
 */
export class otherBoolean extends boolAttribute {

    getDomDisplay(isHidden = false) {
        const labels = {
            first: this.mi18n.get('enableOther'),
            second: this.mi18n.get('enableOtherMsg'),
        }
        return this.getDomDisplayForBool(labels, isHidden)
    }
}

/**
 * multiple Boolean 
 */
 export class multipleBoolean extends boolAttribute {

    getDomDisplay(isHidden = false) {
        const values = this.values
        const mi18n = this.mi18n

        const { type } = values

        let labels = null
        const controlClass = this.controlClass
        if (controlClass && controlClass.getLabelsForMultipleAttribute) {
            labels = controlClass.getLabelsForMultipleAttribute(type, mi18n)
        }

        if ( labels == null ) {
            labels = {
                first: 'Multiple',
                second: 'set multiple attribute',
            }
        }

        return this.getDomDisplayForBool(labels, isHidden)
    }

}

