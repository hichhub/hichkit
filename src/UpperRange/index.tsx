import React, {createRef, useEffect, useState, useRef} from "react"
import style  from "./style.module.scss"
import classNames from "classnames";
import Numeral from "numeral";

// interface IProps {
//     id: string;
//     title?: string;
//     zeroValueLabel: string;
//     currentValue?: number;
//     handleValueChange?: any;
//     handleClick?: any;
//     options: Array<any>;
//     placeholder?: string;
//     keyLabel?: string;
//     valueLabel?: string;
//     inputLength: number;
//     isUpperBound?: boolean;
// }

const UpperRange = ({
    id,
    title,
    zeroValueLabel,
    currentValue,
    handleValueChange,
    options,
    placeholder,
    inputLength = 12,
    isUpperBound = true,
    keyLabel = "name",
    valueLabel = "value"
}//: IProps
) => {

    const [isActive, setActive] = useState(false)
    const [isStoppedBubbling, setStoppedBubbling] = useState(false)
    const inputRef = createRef() as any;
    const optionsRef = useRef(null);

    useEffect(() => {
        if (!isStoppedBubbling && !!optionsRef && !!optionsRef.current){
            optionsRef.current.addEventListener("touchmove", (e) => {e.stopPropagation()})
            setStoppedBubbling(true)
        }
    }, [optionsRef])

    const handleInputFocus = (e) => {
        setActive(true)
        e.target.setSelectionRange(0, e.target.value.length)
    }

    const handleInputBlur = (e) => {
        setTimeout(() => {
            setActive(false)
        }, 200);
    }

    const toggleActivation = (e) => {
        if (isActive){
            setActive(false)
        } else {
            setActive(true)
            inputRef.current.focus();
        }
    }

    const handleInputChange = (e) => {
        const value = e.target.value
        handleValueChange(postProcess(value))
    }

    const postProcess = (rawValue: string) => {
        //pemit only digits
        const digits = rawValue.replace(/[^1234567890۱۲۳۴۵۶۷۸۹۰١٢٣٤٥٦٧٨٩٠]/gi, '')
        if (digits.length > inputLength){
            return currentValue
        }
        //create a string of latinOnly digits
        const latinDigits = digits.toString().replace(/[۱۲۳۴۵۶۷۸۹۰١٢٣٤٥٦٧٨٩٠]/gi, e => { const c = e.charCodeAt(0); return String.fromCharCode(c - (c < 1770 ? 1584 : 1728)) })
        return Number(latinDigits)
    }

    const preProcess = (value: number) => {
        if (!value){
            return ""
        }
        else if (value < 0){
            return zeroValueLabel
        }
        //formats most recent entered value as currency
        const formattedValue = Numeral(String(value)).format('0,0')
        //prepares value for showing only persian digits
        const persianValue = formattedValue.replace(/[1234567890١٢٣٤٥٦٧٨٩٠]/gi, e => { const c = e.charCodeAt(0); return String.fromCharCode(c + (c < 60 ? 1728 : 144)) })
        return persianValue
    }

    const onOptionItemClicked = (value, e) => {
        handleValueChange(value)
        setActive(false)
        inputRef.current.blur();
    }
    
    return (
        <div className={style["upper-range-wrapper"]} onBlur={handleInputBlur}>
            {title && <span className={classNames(style["title"], style["secondary"])}>{title}</span>}
            <div className={style["filter-select"]}>
                <label>{!!isUpperBound ? "تا" : "از"}</label>
                <input 
                    autoComplete="off"
                    id={id}
                    ref={inputRef}
                    className={classNames(style["decimal-input"], {[style["active"]]: isActive})}
                    placeholder={placeholder}
                    type="text"
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    value={preProcess(currentValue)}
                />
                <span 
                    className={classNames({[style["active"]]:isActive})}
                    onClick={toggleActivation}/>
                <span
                    className={style["label"]}
                    onClick={toggleActivation}>
                        تومان
                </span>
                <div className={classNames(style["option-container"], {[style["invisible"]]: !isActive})} ref={optionsRef}>
                    {!!options && options.map((item, index) => (
                        <span key={index} onClick={onOptionItemClicked.bind(this, item[valueLabel] > 5 ? item[valueLabel] : (-1 * Math.abs(item[valueLabel])))}>
                            {item[keyLabel]}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}


export default UpperRange;

