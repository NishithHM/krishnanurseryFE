import React from "react";
import Dropdown from "../Dropdown";
import { formatDropOptions } from "../../pages/AddNewVariants/helper";
const AddNewVariantsSelect = ({ typeOptionsValues, type, typeValues, onTypeChange, index, typeOptionOptions }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        gap: "20px",
        maxWidth: "50rem",
      }}
    >
      <div style={{ flex: "1" }}>
        <Dropdown
          canCreate={true}
          data={formatDropOptions(typeOptionsValues)}
          value={{label: type, value: type}}
          onChange={(e)=>onTypeChange({index, value: e.label, isNew:false, category:"type" })}
          onCreateOption={e=> onTypeChange({index, value: e, isNew:true, category:"type" })}
        />
      </div>
      <div style={{ flex: "2" }}>
        <Dropdown
          isMultiEnabled={true}
          isClearable
          isSearchable
          canCreate={true}
          onCreateOption={e=>onTypeChange({index, value: [...typeValues, e], isNew:true, category:"options" })}
          onChange={e=> onTypeChange({index, value: e?.map(ele=> ele.label), isNew:false, category:"options" })}
          data={formatDropOptions(typeOptionOptions)}
          value={formatDropOptions(typeValues)}
        />
      </div>
    </div>
  );
};

export default AddNewVariantsSelect;
