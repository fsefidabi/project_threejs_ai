import React, { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { easing } from "maath"
import { useSnapshot } from "valtio"
import state from "../store"


function CameraRig(props) {
  const { children } = props

  const groupRef = useRef()
  const snap = useSnapshot(state)

  useFrame((state, delta) => {
    const isBreakPoint = window.innerWidth <=1260
    const isMobile = window.innerWidth <= 600

    // set the initial position of the model
    let targetPosition = [-0.4, 0, 2]

    if (snap.intro) {
      if (isBreakPoint) targetPosition = [0, 0, 2]
      if (isMobile) targetPosition = [0, 0.2, 2.5]
    } else {
      if (isBreakPoint) targetPosition = [0, 0, 2.5]
      else targetPosition = [0, 0, 2]
    }

    // set the camera position
    easing.damp3(
      state.camera.position,
      targetPosition,
      0.25,
      delta
    )

    // set the model rotation
    easing.dampE(
      groupRef.current.rotation,
      [state.pointer.y / 10, -state.pointer.x / 5, 0],
      0.25,
      delta
    )
  })

  return (
    <group ref={groupRef}>
      {children}
    </group>
  )
}

export default CameraRig
