import { useEffect, useState } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { saveSession, loadSession } from "./db";
import localPdf from "./assets/Report.pdf";
import { motion } from "framer-motion";

const App = () => {
  const [pdfUrl, setPdfUrl] = useState<string>(localPdf);
  const [highlights, setHighlights] = useState<{ text: string; position: { x: number; y: number } }[]>([]);
  const [notes, setNotes] = useState<{ text: string; page: number }[]>([]);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const savedHighlights = await loadSession("highlights");
      const savedNotes = await loadSession("notes");


      const localHighlights = localStorage.getItem("highlights");
      const localNotes = localStorage.getItem("notes");

      setHighlights(savedHighlights ?? (localHighlights ? JSON.parse(localHighlights) : []));
      setNotes(savedNotes ?? (localNotes ? JSON.parse(localNotes) : []));
    };

    loadData();
    setPdfUrl(localPdf)
  }, []);

  useEffect(() => {
    saveSession("highlights", highlights);
    saveSession("notes", notes);
    localStorage.setItem("highlights", highlights.toString())
    localStorage.setItem("notes", notes.toString())

  }, [highlights, notes]);

  const handleTextSelect = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && selection?.rangeCount) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (rect.width > 0 && rect.height > 0) {
        setSelectedText(text);
        setTooltipPosition({
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY - 30,
        });
        setShowTooltip(true);
      }
    } else {
      setShowTooltip(false);
    }
  };

  const addHighlight = () => {
    if (selectedText && tooltipPosition) {
      setHighlights([...highlights, { text: selectedText, position: tooltipPosition }]);
      setShowTooltip(false);
    }
  };

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const handleAddNote = (text: string, page: number) => {
    setNotes([...notes, { text, page }]);
  };

  return (
    <div className="p-5 bg-white grid md:grid-cols-2 w-full gap-5 grid-cols-1 text-black h-screen" onMouseUp={handleTextSelect}>
      <div className="flex flex-col ">
        <h1 className="text-2xl font-bold mb-4">Annual Report Viewer</h1>
        <div className="flex max-h-[100%]">
          <motion.div
            className="border p-2 w-3/4 overflow-auto relative"
            style={{
              border: '1px solid rgba(0, 0, 0, 0.3)',
              height: '60vh',
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Worker workerUrl={"https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js"}>
              <Viewer fileUrl={pdfUrl} />
            </Worker>
          </motion.div>
        </div>
        {showTooltip && tooltipPosition && (
          <div
            className="absolute top-0 bg-gray-800 text-white px-2 py-1 rounded shadow-lg"
          >
            <p>Highlight this text?</p>
            <button className="bg-yellow-400 text-black px-2 py-1 rounded" onClick={addHighlight}>Yes</button>
            <button className="ml-2 bg-gray-600 px-2 py-1 rounded" onClick={() => setShowTooltip(false)}>No</button>
          </div>
        )}
      </div>
      <div className="p-4  max-h-screen overflow-y-auto">
        <div className="grid md:grid-cols-2 gap-3 grid-cols-1">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Highlights</h2>
            <ul className="list-disc pl-4">
              {highlights.map((highlight, index) => (
                <li key={index} className="bg-yellow-200 p-2 my-1 flex justify-between items-center">
                  {highlight.text}
                  <button onClick={() => removeHighlight(index)} className="text-red-500 ml-2">❌</button>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Notes</h2>
            <ul className="list-disc pl-4">
              {notes.map((note, index) => (
                <motion.li
                  key={index}
                  className="bg-blue-200 p-2 my-1 flex justify-between items-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <input
                    type="text"
                    className="bg-transparent border-b border-black"
                    value={note.text}
                    onChange={(e) => {
                      const updatedNotes = [...notes];
                      updatedNotes[index].text = e.target.value;
                      setNotes(updatedNotes);
                    }}
                  />
                  <button onClick={() => setNotes(notes.filter((_, i) => i !== index))} className="text-red-500 ml-2">X</button>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        <h2 className="text-lg font-semibold mt-4">Add a Note</h2>
       
          <form className="flex flex-col gap-3" onSubmit={() => {
            const noteText = (document.getElementById("noteText") as HTMLInputElement).value;
            const notePage = parseInt((document.getElementById("notePage") as HTMLInputElement).value);
            if (noteText && notePage) {
              handleAddNote(noteText, notePage);
              (document.getElementById("noteText") as HTMLInputElement).value = "";
              (document.getElementById("notePage") as HTMLInputElement).value = "";
            }
          }}>
            <input required type="text" className="border p-2" placeholder="Enter your note..." id="noteText" />
            <input required type="number" className="border p-2" placeholder="Page Number" id="notePage" />
            <motion.button
              className="bg-blue-500 cursor-pointer rounded-lg text-white p-2"
              type="submit"
              whileTap={{scale:0.8}}
            >
              Add Note
            </motion.button>
          </form>
      
      </div>
    </div>
  );
};

export default App;
