import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSnapshot } from "valtio"

import config from "../config/config"
import state from "../store"
import { download } from "../assets"
import { downloadCanvasToImage, reader } from "../config/helpers"
import { EditorTabs, FilterTabs, DecalTypes } from "../config/constants"
import { fadeAnimation, slideAnimation } from "../config/motion"
import { AIPicker, ColorPicker, CustomButton, FilePicker, Tab } from "../components"

function Customizer(props) {
  const snap = useSnapshot(state)

  const [file, setFile] = useState("")
  const [prompt, setPrompt] = useState("")
  const [generatingImg, setGeneratingImg] = useState(false)
  const [activeEditorTab, setActiveEditorTab] = useState("")
  const [activeFilterTab, setActiveFilterTab] = useState({
    logoShirt: false,
    stylishShirt: false
  })

  function generateTabContent() {
    switch (activeEditorTab) {
      case "colorpicker":
        return <ColorPicker/>
      case "filepicker":
        return <FilePicker
          file={file}
          setFile={setFile}
          readFile={readFile}
        />
      case "aipicker":
        return <AIPicker
          prompt={prompt}
          setPrompt={setPrompt}
          generatingImg={generatingImg}
          handleSubmit={handleSubmit}
        />
      default:
        return null
    }
  }

  async function handleSubmit(type) {
    if (!prompt) return alert("Please enter the prompt")

    try {
      setGeneratingImg(true)
      const res = await fetch("http://localhost:8080/api/v1/dalle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      })
      const data = await res.json()
      handleDecals(type, `data:image/png;base64,${data.photo}`)
    } catch (err) {
      alert(err)
    } finally {
      setGeneratingImg(false)
      setActiveEditorTab("")
    }
  }

  function handleDecals(type, result) {
    const decalType = DecalTypes[type]
    state[decalType.stateProperty] = result

    if (!activeFilterTab[decalType.filter]) {
      handleActiveFilterTab(decalType.filterTab)
    }
  }

  function handleActiveFilterTab(tabName) {
    switch (tabName) {
      case "logoShirt":
        state.isLogoTexture = !activeFilterTab[tabName]
        break
      case "stylishShirt":
        state.isFullTexture = !activeFilterTab[tabName]
        break
      default:
        state.isLogoTexture = true
        state.isFullTexture = false
        break
    }
    setActiveFilterTab((prevState => {
      return {
        ...prevState,
        [tabName]: !prevState[tabName]
      }
    }))
  }

  function readFile(type) {
    reader(file).then((result) => {
      handleDecals(type, result)
      setActiveEditorTab("")
    })
  }

  return (
    <AnimatePresence>
      {!snap.intro && (
        <>
          <motion.div key={"custom"} className={"absolute top-0 left-0 z-10"} {...slideAnimation("left")}>
            <div className={"flex items-center min-h-screen"}>
              <div className={"editortabs-container tabs"}>
                {EditorTabs.map(tab => (
                  <Tab
                    key={tab.name}
                    tab={tab}
                    handleClick={() => setActiveEditorTab(tab.name)}
                  />
                ))}

                {generateTabContent()}
              </div>
            </div>
          </motion.div>

          <motion.div className={"absolute z-10 top-5 right-5"} {...fadeAnimation}>
            <CustomButton
              type={"filled"}
              title={"Go Back"}
              customStyles={"w-fit px-4 py-2.5 font-bold text-sm"}
              handleClick={() => state.intro = true}
            />
          </motion.div>

          <motion.div className={"filtertabs-container"} {...slideAnimation("up")}>
            {FilterTabs.map(tab => (
              <Tab
                key={tab.name}
                tab={tab}
                isFilterTab
                isActiveTab={""}
                handleClick={() => handleActiveFilterTab(tab.name)}
              />
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Customizer