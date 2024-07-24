import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function Challenge({ setVerified }) {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const [position, setPosition] = useState({ x: 50, y: screenHeight / 2 - 17 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [isShot, setIsShot] = useState(false);
  const [power, setPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showMessage, setShowMessage] = useState(false);

  const gravity = 9.8 * 100;
  const maxPower = 1000;
  const angle = Math.PI / 4; // 45 degrees in radians
  const ballRadius = 2.5; // Half of the ball's width/height

  const chargeInterval = useRef(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (attempts === 0) {
        setShowMessage(true);
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [attempts]);

  function startCharging() {
    setIsCharging(true);
    chargeInterval.current = setInterval(() => {
      setPower((prev) => Math.min(prev + 5, maxPower));
    }, 20);
  }

  function shoot() {
    setIsCharging(false);
    clearInterval(chargeInterval.current);
    if (!isShot) {
      setIsShot(true);
      setPosition({ x: 50, y: screenHeight / 2 - 17 });
      setVelocity({
        x: power * Math.cos(angle),
        y: power * Math.sin(angle),
      });
    }
    setPower(0);
  }

  function checkLineCollision(pos) {
    if (
      pos.y >= screenHeight / 2 - ballRadius - 15 &&
      pos.y <= screenHeight / 2 + ballRadius - 15
    ) {
      // Check left side of the gap
      if (pos.x < screenWidth * 0.4 - ballRadius) {
        return true;
      }
      // Check right side of the gap
      if (pos.x > screenWidth * 0.6 + ballRadius) {
        return true;
      }
    }
    return false;
  }
  function checkButtonCollision(pos) {
    return (
      pos.x + ballRadius > screenWidth - 180 &&
      pos.x - ballRadius < screenWidth &&
      pos.y + ballRadius > screenHeight - 80 &&
      pos.y - ballRadius < screenHeight
    );
  }

  function markChallengeAsCompleted() {
    localStorage.setItem("challenge", "completed");
  }

  function skipChallenge() {
    markChallengeAsCompleted();
    setVerified(true);
  }

  useEffect(() => {
    let animationFrameId;

    if (isShot) {
      let lastTime;
      function animate(time) {
        if (lastTime != null) {
          const deltaTime = (time - lastTime) / 1000;

          let newPos = {
            x: position.x + velocity.x * deltaTime,
            y: position.y - velocity.y * deltaTime,
          };

          let newVel = {
            x: velocity.x,
            y: velocity.y - gravity * deltaTime,
          };

          if (checkLineCollision(newPos)) {
            newPos.y = screenHeight / 2 - 17; // Position the ball right on the line
            newVel.y = -newVel.y * 0.75; // Bounce with a restitution factor (0.75)

            // Apply rolling resistance only when on the ground
            if (Math.abs(newVel.y) < 1.5) {
              newVel.y = 0; // Stop bouncing if the bounce is too small
              newVel.x *= 0.98; // Apply rolling resistance
              if (Math.abs(newVel.x) < 1.5) {
                newVel.x = 0; // Stop horizontal movement if it's too small
              }
            }
          }

          if (checkButtonCollision(newPos)) {
            markChallengeAsCompleted();
            setVerified(true);
            return;
          }

          setPosition(newPos);
          setVelocity(newVel);
        }
        lastTime = time;
        animationFrameId = requestAnimationFrame(animate);
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isShot, position, velocity]);

  function resetGame() {
    setIsShot(false);
    setPosition({ x: 50, y: screenHeight / 2 - 17 });
    setVelocity({ x: 0, y: 0 });
    setPower(0);
    setAttempts((prev) => prev + 1);
    setShowMessage(false);
  }

  function renderTrajectory() {
    const trajectoryPoints = [];
    const initialVelocity = {
      x: power * Math.cos(angle),
      y: power * Math.sin(angle),
    };
    const timeSteps = 10; // Number of total points in the trajectory
    const stepInterval = 0.05; // Time interval between points

    for (let i = 1; i <= timeSteps; i++) {
      const t = i * stepInterval;
      const x = position.x + initialVelocity.x * t;
      const y = position.y - initialVelocity.y * t + 0.5 * gravity * t * t;
      if (x > screenWidth || y > screenHeight || y < 0) {
        break;
      }
      trajectoryPoints.push({ x, y });
    }

    return trajectoryPoints.map((point, index) => (
      <div
        key={index}
        className="absolute w-2 h-2 bg-red-500 rounded-full"
        style={{
          left: `${point.x - 1}px`,
          top: `${point.y - 1}px`,
        }}
      />
    ));
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Explanatory message */}

      {/* Middle line with gap */}
      <div className="absolute top-1/2 left-0 w-[40%] h-1 bg-white" />
      <div className="absolute top-1/2 right-0 w-[40%] h-1 bg-white" />

      {/* Message */}
      {showMessage && (
        <div className="absolute top-20 w-full text-center text-white text-lg">
          Trying to get to Movie Master? All you need to do is get "U" or
          yourself to MovieMaster!
        </div>
      )}
      {/* Button target */}
      <div className="absolute bottom-0 right-0 w-[180px] h-[80px] bg-green-500">
        <img src="/smallScrnShot.png" alt="" />

        {/* Bouncing arrow */}
        {showMessage && (
          <div className="absolute top-[-50px] left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ transform: "rotate(180deg)" }}
            >
              <path d="M15 0L30 15L25 15L15 5L5 15L0 15L15 0Z" fill="white" />
              <rect x="12" y="5" width="6" height="25" fill="white" />
            </svg>
          </div>
        )}
      </div>

      {/* Trajectory */}
      {!isShot && isCharging && renderTrajectory()}

      {/* Ball */}
      <div
        className="absolute w-5 h-5 rounded-full text-center text-sm bg-red-500"
        style={{
          left: `${position.x - ballRadius}px`,
          top: `${position.y - ballRadius}px`,
        }}
      >
        U{" "}
      </div>

      {/* Shoot button */}
      <div className="absolute bottom-5 w-full items-center flex flex-col gap-2">
        <button
          className={`px-4 py-2 rounded-2xl text-black transition-opacity duration-300 ${
            isCharging ? "bg-gray-200" : "bg-white"
          } hover:opacity-80 focus:outline-none`}
          onMouseDown={startCharging}
          onMouseUp={shoot}
          onMouseLeave={shoot}
          onTouchStart={startCharging}
          onTouchEnd={shoot}
          disabled={isShot}
        >
          {isCharging ? "Charging..." : "Shoot"}
        </button>

        <button
          className={`px-4 py-2 rounded-2xl text-black transition-opacity duration-300 bg-white hover:opacity-80 focus:outline-none`}
          onClick={resetGame}
        >
          Try Again
        </button>
      </div>
      {/* New skip button and message */}
      {attempts >= 4 && (
        <div className="absolute top-36 w-full items-center flex flex-col items-center">
          <p className="text-white mb-2">
            Struggling? You can skip the challenge if you want.
          </p>
          <button
            className="px-4 py-2 rounded-2xl text-black transition-opacity duration-300 bg-yellow-400 hover:opacity-80 focus:outline-none"
            onClick={skipChallenge}
          >
            Skip Challenge
          </button>
        </div>
      )}
    </div>
  );
}
