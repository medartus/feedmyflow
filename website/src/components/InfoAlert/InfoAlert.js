import React from 'react';
import SweetAlert from 'react-bootstrap-sweetalert';

import "./InfoAlert.css"


export default ({ content, ...props }) => {
    return (
        <SweetAlert {...props}>
        </SweetAlert>    
    )
}

