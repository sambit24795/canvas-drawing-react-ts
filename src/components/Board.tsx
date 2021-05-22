import React, { useEffect, useRef, useCallback, useState } from "react";

import classes from "./Board.module.css";
import Modal from "../ui/Modal";
import Buttons from "./Buttons";
import socket from "../utils/connectSocket";

interface IBoardProps {}

const Board: React.FunctionComponent<IBoardProps> = (props) => {
  const [clicked, setClicked] = useState<boolean>(false);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [mouseY, setMouseY] = useState<number | null>(null);
  const [color, setColor] = useState<string>("#ff0000");
  const [size, setSize] = useState<number>(20);
  const [showModal, setShowModal] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  const [drawing, setDrawing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const drawCircle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    size: number
  ) => {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };

  const drawLine = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    size: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 2;
    ctx.stroke();
  };

  const mouseDownHandler = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    setClicked(true);
    setMouseX(event.nativeEvent.offsetX);
    setMouseY(event.nativeEvent.offsetY);
  };

  const mouseUpHandler = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    setClicked(false);
    setMouseX(event.nativeEvent.offsetX);
    setMouseY(event.nativeEvent.offsetY);
  };

  const mouseMoveHandler = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (clicked) {
      const x2 = event.nativeEvent.offsetX;
      const y2 = event.nativeEvent.offsetY;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d")!;

      drawCircleMemo(ctx, x2, y2, color, size);
      drawLineMemo(ctx, mouseX!, mouseY!, x2, y2, color, size);

      setMouseX(x2);
      setMouseY(y2);
    }
  };

  const drawCircleMemo = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      color: string,
      size: number
    ) => {
      drawCircle(ctx, x, y, color, size);
    },
    []
  );

  const drawLineMemo = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      color: string,
      size: number
    ) => {
      drawLine(ctx, x1, y1, x2, y2, color, size);
    },
    []
  );

  const submitHandler = async () => {
    if (!inputRef.current?.value) {
      return;
    }

    const res = await fetch(
      `http://localhost:5000/user/${inputRef.current.value}`,
      {
        method: "POST",
      }
    );
    if (res.status === 409) {
      alert("choose different name");
      return;
    }
    const data = await res.json();
    if (data.user.username) {
      setShowModal(false);
    }
    setUsername(data.user.username);
    setColor(data.user.color);
  };

  const saveHandler = () => {
    const ctx = canvasRef.current!;
    if (ctx && username) {
      ctx.toBlob(async (blob) => {
        const random = Math.random().toString(36).substring(7);
        const file = new File([blob!], `canvas-image-${random}.png`, {
          type: "image/png",
        });

        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("http://localhost:5000/image/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        console.log(data);
      });
    }
  };

  useEffect(() => {
    socket.on("node-canvas-data", (data) => {
      console.log("canvas data", data);
      const interval = setInterval(() => {
        if (drawing) {
          return;
        }
        setDrawing(true);
        clearInterval(interval);
        const image = new Image();
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        image.onload = () => {
          ctx?.drawImage(image, 0, 0);
          setDrawing(false);
        };
        image.src = data;
      });
    });

    const timer: NodeJS.Timeout = setTimeout(() => {
      const ctx = canvasRef.current!;
      const base64Image = ctx.toDataURL("image/png");
      const file = ctx.toBlob((blob) => {
        const blb = new File([blob!], "canvas-image.png", {
          type: "image/png",
        });
        console.log(blb);
        return blb;
      });

      console.log("file", file);
      console.log("executing");
      if (base64Image) {
        socket.emit("canvas-data", base64Image);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [drawing, mouseX, mouseY]);

  return (
    <React.Fragment>
      {showModal && (
        <Modal>
          <label>Enter your name:</label>
          <input type="text" ref={inputRef} />
          <button onClick={() => submitHandler()}>Submit</button>
        </Modal>
      )}
      <div className={classes.container}>
        <Buttons
          setColor={setColor}
          color={color}
          size={size}
          setSize={setSize}
        />
        <canvas
          className={classes["canvas-element"]}
          height="500"
          width="800"
          id="canvas"
          ref={canvasRef}
          onMouseDown={(event) => mouseDownHandler(event)}
          onMouseUp={(event) => mouseUpHandler(event)}
          onMouseMove={(event) => mouseMoveHandler(event)}
        ></canvas>
        <button
          className={classes["save-button"]}
          onClick={() => saveHandler()}
        >
          Save
        </button>
      </div>
    </React.Fragment>
  );
};

export default Board;
