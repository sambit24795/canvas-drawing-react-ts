import React, { useEffect, useRef, useCallback, useState } from "react";
import Buttons from "../utils/Buttons";

import classes from "./Board.module.css";

interface IBoardProps {}

const Board: React.FunctionComponent<IBoardProps> = (props) => {
  const [clicked, setClicked] = useState<boolean>(false);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [mouseY, setMouseY] = useState<number | null>(null);
  const [color, setColor] = useState<string>("#ff0000");
  const [size, setSize] = useState<number>(20);

  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    console.log(clicked, mouseX, mouseY, "down");
  };

  const mouseUpHandler = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    setClicked(false);
    setMouseX(event.nativeEvent.offsetX);
    setMouseY(event.nativeEvent.offsetY);

    console.log(clicked, mouseX, mouseY, "up");
    //console.log(event);
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

  useEffect(() => {
    /* const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d")!;
    drawCircleMemo(ctx, 100, 200, "red");
    drawLineMemo(ctx, 300, 300, 300, 500, "red"); */
  }, [canvasRef, drawCircleMemo, drawLineMemo]);

  return (
    <div className={classes.container}>
      <Buttons
        setColor={setColor}
        color={color}
        size={size}
        setSize={setSize}
      />
      <canvas
        className={classes["canvas-element"]}
        height="600"
        width="800"
        id="canvas"
        ref={canvasRef}
        onMouseDown={(event) => mouseDownHandler(event)}
        onMouseUp={(event) => mouseUpHandler(event)}
        onMouseMove={(event) => mouseMoveHandler(event)}
      ></canvas>
    </div>
  );
};

export default Board;
