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

const url = 'http://15.207.187.17:3002'

const NFC = () => {
    const [status, setStatus] = useState('Generating Review...')
    const [api, setApi] = useState(false)
    const [data, setData] = useState({})
    const params = useParams()

    useEffect(() => {
        setApi(true)
    }, [])

    useEffect(() => {
        if (api) {
            getReview()
        }
    }, [api])

    const getReview = () => {
        axios.get(`${url}/add-review/${params.id}`).then((res) => {
            setData(res.data)
            setStatus('Copying review to Clipboard')
            setTimeout(() => {
                setStatus('Tap to review')
            }, 500)
            console.log(res.data)
        }).catch(err => {
            console.log(err)
            setStatus(err?.response?.data || "Something went wrong")
        })
    }
    return (
        <div onClick={()=> unsecuredCopyToClipboard(data)} style={{height:'100vh', width:'100vw'}}>
            <h3>
                {status}
            </h3>
        </div>
    )
}

export default NFC;