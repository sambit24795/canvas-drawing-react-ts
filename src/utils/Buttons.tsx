import React, { useEffect, useState } from "react";

import classes from "./Buttons.module.css";

interface IButtonsProps {
  setColor: React.Dispatch<React.SetStateAction<string>>;
  color: string;
  setSize: React.Dispatch<React.SetStateAction<number>>;
  size: number;
}

const Buttons: React.FunctionComponent<IButtonsProps> = (props) => {
  const [erase, setErase] = useState<boolean>(false);
  const [colorBackup, setColorBackup] = useState<string | null>(null);

  const colorChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.setColor(event.target.value);
    setColorBackup(event.target.value);
    setErase(false);
  };

  const increaseHandler = () => {
    props.setSize((prevState) => (prevState += 3));

    if (props.size > 50) {
      props.setSize(50);
      return;
    }
  };

  const decreaseHandler = () => {
    props.setSize((prevState) => (prevState -= 3));

    if (props.size < 5) {
      props.setSize(5);
      return;
    }
  };

  const eraseHandler = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setErase((prevState) => !prevState);
  };

  useEffect(() => {
    if (erase) {
      if (!colorBackup) {
        setColorBackup(props.color);
      }

      props.setColor("#91b4d5");
      return;
    }

    if (colorBackup && !erase) {
      console.log(colorBackup);
      props.setColor(colorBackup);
    }
  }, [erase, props, colorBackup]);

  return (
    <div className={classes["button-container"]}>
      <button id="decrease" onClick={() => decreaseHandler()}>
        -
      </button>
      <button id="increase" onClick={() => increaseHandler()}>
        +
      </button>
      <button
        id="erase"
        className={erase ? classes["erase-button"] : ""}
        onClick={(e) => eraseHandler(e)}
      >
        Erase
      </button>
      <input
        type="color"
        name="color"
        id="color"
        value={props.color}
        onChange={(e) => colorChangeHandler(e)}
      />
    </div>
  );
};

export default Buttons;
