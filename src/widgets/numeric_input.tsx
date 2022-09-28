import Decimal from "decimal.js"
import NumberFormat from "react-number-format"

export interface NumericInputProps {
    value: Decimal
    onChanged: (value: Decimal) => void
    name?: string
    className?: string
}

export const NumericInput = (props: NumericInputProps) => {
    return (
        <NumberFormat thousandSeparator={true}  className={ props.className } value={ props.value.toString() } onValueChange={values => {
            let formattedValue = values.formattedValue
            formattedValue = formattedValue.replaceAll(",", "")
            if (formattedValue[0] === '0' && formattedValue.length > 1) {
                formattedValue = formattedValue.slice(1, formattedValue.length)
            }

            try {
                let dec = new Decimal(formattedValue)
                props.onChanged(dec)
            } catch (exception) {}
        }}></NumberFormat>
    )
    
}