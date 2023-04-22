import _ from 'lodash'
import dayjs from 'dayjs'
const rquiredData=[
    "procuredOn",
    "quantity",
    "vendorName",
    "vendorContact",
    "totalPrice",
]
export const getTableBody=(data)=>{
        if(data?.__isNew__){
            return []
        }else{
            if(_.isEmpty(data?.meta?.procurementHistory )){
                return []
            }else{
                const history = data?.meta?.procurementHistory
                const result = history?.map(ele=>{
                    const data = rquiredData.map(data=>{
                        if(data === 'procuredOn'){
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
}
