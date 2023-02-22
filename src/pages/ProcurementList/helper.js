import dayjs from 'dayjs'
import _ from 'lodash' 
const requiredData = [
    "lastProcuredOn",
    "plantName",
    "totalQuantity",
    "remainingQuantity",
]
export const getProcurementListTableBody = (data)=>{
    // console.log(data)
    if(_.isEmpty(data)){
        return []
    } else{
        const history = data?.map((ele)=>{
            const res = requiredData?.map((res)=>{
                // console.log(ele)
                // console.log(res)
                if(res==="lastProcuredOn"){
                    return { value: dayjs(ele[res]).format('DD/MM/YYYY')}
                } else if(res === "plantName"){
                    return {value : ele?.names?.en?.name}
                } else{
                    return {value:ele[res]}
                }
            })
            return res
        })
        return history
    }

}