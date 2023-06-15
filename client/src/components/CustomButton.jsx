import React from "react"
import { useSnapshot } from "valtio"
import state from "../store"
import { getContrastingColor } from "../config/helpers"

function CustomButton(props) {
  const { type, title, customStyles, handleClick } = props

  const snap = useSnapshot(state)

  function generateStyle(type) {
    if (type === "filled") {
      return {
        backgroundColor: snap.color,
        color: getContrastingColor(snap.color)
      }
    } else if (type === "outline") {
      return {
        border: `1px solid ${snap.color}`,
        color: snap.color
      }
    }
  }

  return (
    <button
      className={`px-2 py-1.5 flex-1 rounded-md ${customStyles}`}
      style={generateStyle(type)}
      onClick={handleClick}
    >
      {title}
    </button>
  )
}

export default CustomButton
