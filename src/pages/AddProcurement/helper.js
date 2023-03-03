import _ from 'lodash'
import dayjs from 'dayjs'
const rquiredData=[
    "procuredOn",
    "quantity",
    "vendorName",
    "vendorContact",
    "totalPrice",
    "createdOn"
]
export const getTableBody=(data)=>{
            if(_.isEmpty(data )){
                return []
            }else{
                const history = data
                const result = history?.map(ele=>{
                    const data = rquiredData.map(data=>{
                        if(data === 'procuredOn' || data ==='createdOn'){
                            return { value: dayjs(ele[data]).format('DD/MM/YYYY')}
                        }else if(data === 'totalPrice'){
                            return {value: (ele[data]/ele.quantity).toFixed(2) }
                        }else{
                            return { value :ele[data] }
                        }
                    })
                    return data
                })
                return result
            }
}
