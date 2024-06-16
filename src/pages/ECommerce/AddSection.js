import React, { useState } from "react";
import Styles from "./AddSection.module.css";
import { BackButton, Button, Dropdown, Input, Search } from "../../components";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const AddSection = () => {

    const [addSection, setAddSection] = useState([])
    console.log(addSection)
    const [editorData, setEditorData] = useState('');

    const onAddSectionClick = () => {
        const newCard = { id: addSection.length + 1 }
        setAddSection([...addSection, newCard])
    }
    return (
        <div className={Styles.sectionContainer}>
            <div className={Styles.innerSection}>
                <div>
                    <BackButton navigateTo={"/authorised/dashboard"} tabType="ECommerce" />
                </div>
                <div className={Styles.innerContainer}>
                    <div className={Styles.addSectionBtn}>
                        <Button
                            title="Add Section"
                            onClick={onAddSectionClick}
                        />
                    </div>
                    {addSection?.map((ele) => {
                        return (
                            <div key={ele.id} className={Styles.card}>
                                <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
                                    <div className={Styles.searchContainer}>
                                        <Search
                                            //value={searchInput}
                                            title="Search for a Plant..."
                                        //onChange={handleSearchInputChange}
                                        />
                                    </div>
                                    <div className={Styles.dropdownContainer}>
                                        <Dropdown
                                         isMultiEnabled={true}
                                            placeholder="Section Type"
                                        //data={typeOptions}
                                        //value={selectedTypeOption}
                                        //onChange={(e) => setSelectedTypeOption(e)}
                                        />
                                    </div>
                                    <div style={{ width: "50%", marginBottom: "25px", marginLeft: "20px" }}>
                                        <Input
                                            title="Section Name"
                                            //value={gst}
                                            type="text"
                                        //onChange={(e) => setGST(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="App">
      <h2>CKEditor 5 in React</h2>
      <CKEditor
        editor={ClassicEditor}
        data="<p>Hello from CKEditor 5!</p>"
        onReady={editor => {
          console.log('Editor is ready to use!', editor);
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          setEditorData(data);
          console.log({ event, editor, data });
        }}
        onBlur={(event, editor) => {
          console.log('Blur.', editor);
        }}
        onFocus={(event, editor) => {
          console.log('Focus.', editor);
        }}
      />
      <div>
        <h3>Editor Data:</h3>
        <div>{editorData}</div>
      </div>
    </div>
        </div>
    )
}

export default AddSection