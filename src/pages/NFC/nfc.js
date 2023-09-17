import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useMatch, useParams } from "react-router-dom";
export function unsecuredCopyToClipboard({review, redirectTo}) {
    const textArea = document.createElement("textarea");
    textArea.value = review;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand("copy");
        window.location.href = redirectTo
    } catch (err) {
        console.error("Unable to copy to clipboard", err);
    }
    document.body.removeChild(textArea);
}


const NFC = () => {
  
    const params = useParams()

    useEffect(() => {
        window.location.href = `http://15.207.187.17:5001/nfc-test/${params.id}`
    }, [])

    

   
    return (
        <div>
        </div>
    )
}

export default NFC;