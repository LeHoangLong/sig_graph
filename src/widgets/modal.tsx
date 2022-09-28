import React from "react"
import styles from './modal.module.scss'

export interface ModalProps {
    children: React.ReactNode[] | React.ReactNode
    display: boolean
    className?: string
}

export const Modal = (props: ModalProps) => {
    return (
        <div className={ props.display ? styles.modal_container_show : styles.modal_container_hidden }>
            <div className={ props.className ?? styles.modal }>
                { props.children }
            </div>
        </div>
    )
}