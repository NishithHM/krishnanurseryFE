import Dropdown from "./components/Dropdown/Dropdown";

function App() {
  // dummy data sent to select components
  const data = [
    { value: "id1", label: "option1" },
    { value: "id2", label: "option2" },
  ];

  const onChangeHandler = (value) => {
    // update the state as required
    console.log(value);
  };

  return (
    <div className="App">
      <div style={{ maxWidth: "500px", padding: "10px 20px" }}>
        <p>fetch from api dropdown</p>
        <Dropdown onChange={onChangeHandler} url="dsadf" />

        <p>fetch from api dropdown with multiselect</p>
        <Dropdown
          onChange={onChangeHandler}
          url="dsadf"
          isMultiEnabled={true}
          isClearable={true}
        />

        <p>creatable dropdown with multiselect</p>
        <Dropdown
          canCreate={true}
          data={data}
          onChange={onChangeHandler}
          isMultiEnabled={true}
          isClearable={true}
        />

        <p>creatable dropdown without multi select</p>
        <Dropdown canCreate={true} data={data} onChange={onChangeHandler} />

        <p>select with single option dropdown</p>
        <Dropdown
          data={data}
          onChange={onChangeHandler}
          isMultiEnabled={true}
          isClearable={true}
        />

        <p>select with single option dropdown</p>
        <Dropdown data={data} onChange={onChangeHandler} />
      </div>
    </div>
  );
}

export default App;
