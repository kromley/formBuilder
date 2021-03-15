/**
 * base attribute for creating DOM for editing attribute fields
 */
export default class baseAttributeClass {
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
        this.h = context.helper
        this.controls = context.controls
    }

    //just an abstract method
    getDomDisplay() { //(isHidden = false) {
        alert('this class method should always be overwritten')
    }

    /* -- helper functions -- */
    static getOuterStyleAttribs = (specificClass, isHidden) =>
    {
        const divAttrs = {
            className: `form-group ${specificClass}`
        }
        if (isHidden) {
            divAttrs.style = 'display: none'
        }
        return divAttrs
    }


}


  