import "./customCss.css";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import { useState, useEffect, useRef } from "react";
export const Input = ({ type, placeholder, value, onChange, disabled }) => {
  return (
    <div className="flex flex-col gap-2">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-[280px] h-[60px] rounded-[13px] px-5"
      />
    </div>
  );
};

export const Button = ({ title, onClick }) => {
  return (
    <div
      className="w-[280px] h-[60px] flex items-center justify-center rounded-[13px] bg-[#FF5C00] cursor-pointer hover:opacity-90"
      onClick={onClick}
    >
      <span className="text-white text-[20px] font-bold">{title}</span>
    </div>
  );
};

export const Select = ({ options, value, onChange, placeholder, disabled }) => {
  return (
    <div className="flex flex-col gap-2">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-[280px] h-[60px] rounded-[13px] px-5 custom-select"
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export const TextArea = ({ placeholder, value, onChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-[280px] h-[150px] rounded-[13px] px-5 py-3"
        rows={5}
      />
    </div>
  );
};

export const GoogleAutocomplete = ({
  placeholder,
  value,
  getAddress,
  getLocation,
}) => {
  const [address, setAddress] = useState(value);

  const handleSelect = async (value) => {
    const results = await geocodeByAddress(value);
    const latLng = await getLatLng(results[0]);
    getAddress(value);
    getLocation(latLng);
  };

  useEffect(() => {
    setAddress(value);
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <PlacesAutocomplete
        value={address}
        onChange={setAddress}
        onSelect={handleSelect}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <input
              {...getInputProps({
                placeholder: placeholder,
                className:
                  "w-[280px] h-[60px] rounded-[13px] px-5 custom-select mb-2",
              })}
            />
            <div>
              {loading ? <div>...loading</div> : null}

              {suggestions.map((suggestion) => {
                const style = {
                  backgroundColor: suggestion.active ? "#41b6e6" : "#fff",
                };

                return (
                  <div
                    {...getSuggestionItemProps(suggestion, { style })}
                    key={suggestion.placeId}
                  >
                    {suggestion.description}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PlacesAutocomplete>
    </div>
  );
};

export const Modal = ({
  placeholder,
  options,
  onChange,
  values,
  isMultiple,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(values);
  const wrapperRef = useRef(null);

  const useOutSideAlert = () => {
    useEffect(() => {
      function handleClickOutside(event) {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
          setOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
  };

  useEffect(() => {
    setSelected(values);
  }, [open, values]);
  useOutSideAlert();

  return (
    <>
      <ul
        className="w-[280px] min-h-[60px] rounded-[13px] px-5 py-2 flex flex-col gap-1 bg-white cursor-pointer justify-center"
        disabled={disabled}
        onClick={() => !disabled && setOpen(true)}
      >
        {values.length === 0 ? (
          <li>{placeholder}</li>
        ) : (
          values.map((value, index) => <li key={index}>{value}</li>)
        )}
      </ul>
      <div
        className={`fixed top-0 left-0 w-full h-full flex items-center justify-center bg-[black] bg-opacity-50 z-50 ${
          open ? "block" : "hidden"
        }`}
      >
        <div
          className="bg-[#1BF2DD] rounded-[13px] p-10 w-[760px]"
          ref={wrapperRef}
        >
          <h1 className="text-black text-[20px] font-bold pb-10 text-center">
            {placeholder}
          </h1>
          <div className="flex justify-center items-center flex-wrap gap-10">
            {options.map((option, index) => (
              <div
                key={index}
                className={`w-[280px] h-[60px] rounded-[13px] flex items-center justify-center cursor-pointer ${
                  selected.includes(option) ? "bg-[#FD3A84]" : "bg-white"
                } ${selected.includes(option) ? "text-white" : "text-black"}`}
                onClick={() => {
                  if (isMultiple) {
                    if (selected.includes(option)) {
                      setSelected(selected.filter((item) => item !== option));
                    } else {
                      setSelected([...selected, option]);
                    }
                  } else {
                    setSelected([option]);
                  }
                }}
              >
                <span>{option}</span>
              </div>
            ))}
            <Button
              title="Done"
              onClick={() => {
                onChange(selected);
                setOpen(false);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
