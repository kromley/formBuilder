import boolAttribute from './boolAttribute'

/*** Toggle Boolean */
 export class inlineBoolean extends boolAttribute {

    constructor(context, values) {
        super(context, 'inline', values)
    }

    getDomDisplay(isHidden = false) {
        const { type } = this.values
        const labels = {
            first: this.mi18n.get('inline'),
            second: this.mi18n.get('inlineDesc', type.replace('-group', '')),
            }
        return this.getDomDisplayBase(labels, isHidden)
    }
 }

/*** Required Field Boolean */
 export class requiredBoolean extends boolAttribute {

    constructor(context, values) {
        super(context, 'required', values)
    }
 }

 /**
 * Require Valid Option Boolean 
 */
export class requireValidOptionBoolean extends boolAttribute {

    constructor(context, values) {
        super(context, 'requireValidOption', values)
    }

    getDomDisplay(isHidden = false) {
        const labels = {
            first: ' ',
            second: this.mi18n.get('requireValidOption'),
          }
        return this.getDomDisplayBase(labels, isHidden)
    }

}

/*** Toggle Boolean */
export class toggleBoolean extends boolAttribute {

    constructor(context, values) {
        super(context, 'toggle', values)
    }
 }

 /**
 * Other Boolean 
 */
export class otherBoolean extends boolAttribute {

    constructor(context, values) {
        super(context, 'other', values)
    }

    getDomDisplay(isHidden = false) {
        const labels = {
            first: this.mi18n.get('enableOther'),
            second: this.mi18n.get('enableOtherMsg'),
        }
        return this.getDomDisplayBase(labels, isHidden)
    }

}

/**
 * Other Boolean 
 */
 export class multipleBoolean extends boolAttribute {

    constructor(context, values) {
        super(context, 'multiple', values)
    }

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

        return this.getDomDisplayBase(labels, isHidden)
    }

}

