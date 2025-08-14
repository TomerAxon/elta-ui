import React, { useEffect, useMemo, useRef, useState } from 'react'
import Plot from 'react-plotly.js'
import { Mosaic, MosaicWindow, MosaicContext, MosaicWindowContext, createBalancedTreeFromLeaves, SplitButton, RemoveButton, updateTree } from 'react-mosaic-component'
import { Resizable } from 'react-resizable'
import 'react-resizable/css/styles.css'
import './app.css'
import 'react-mosaic-component/react-mosaic-component.css'

const initialLeaves = ['a', 'b', 'c', 'd']

// Approximate color stops for common Plotly color scales (for CSS gradients)
const PALETTE_NAME_TO_COLORS = {
    Viridis: ['#440154', '#3b528b', '#21918c', '#5ec962', '#fde725'],
    Cividis: ['#00224e', '#2c4f6b', '#576d6d', '#8a8f65', '#d7c77a'],
    Plasma: ['#0d0887', '#6a00a8', '#b12a90', '#e16462', '#fca636', '#f0f921'],
    Inferno: ['#000004', '#1f0c48', '#550f6d', '#88226a', '#b63655', '#e35933', '#fcffa4'],
    Magma: ['#000004', '#1c1044', '#4f127b', '#812581', '#b5367a', '#e55964', '#fb8761', '#feca8d', '#fbfdbf'],
    Turbo: ['#30123b', '#4145ab', '#2db7d5', '#41f1b6', '#e9fe6e', '#f9a31a', '#c71b1e'],
    Portland: ['#0d0887', '#6a00a8', '#b12a90', '#e16462', '#fca636'],
    Jet: ['#00007F', '#0000FF', '#00FFFF', '#FFFF00', '#FF0000', '#7F0000'],
    Greys: ['#000000', '#444444', '#888888', '#bbbbbb', '#eeeeee', '#ffffff'],
    YlGnBu: ['#ffffcc', '#a1dab4', '#41b6c4', '#2c7fb8', '#253494'],
    YlOrRd: ['#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026'],
    Blues: ['#f7fbff', '#c6dbef', '#6baed6', '#3182bd', '#08519c'],
    Greens: ['#f7fcf5', '#c7e9c0', '#74c476', '#31a354', '#006d2c'],
    Reds: ['#fff5f0', '#fcbba1', '#fb6a4a', '#de2d26', '#a50f15'],
    Picnic: ['#0000ff', '#00ffff', '#ffff00', '#ff0000'],
    Rainbow: ['#9400D3', '#4B0082', '#0000FF', '#00FF00', '#FFFF00', '#FF7F00', '#FF0000'],
    Earth: ['#0000a7', '#00a0a7', '#00a700', '#a7a700', '#a75400', '#a70000'],
    Electric: ['#000000', '#2a3bd7', '#ff2b2b', '#ffff00', '#ffffff'],
    Blackbody: ['#000000', '#780000', '#e63200', '#ffff00', '#ffffff'],
    Cubehelix: ['#000000', '#3f2b64', '#594c86', '#6f7aa6', '#81a9bf', '#98d3c9', '#c2f0b8', '#f5fbb4'],
}

function cssGradientForPalette(name) {
    const colors = PALETTE_NAME_TO_COLORS[name]
    if (!colors) return 'linear-gradient(to right, #999, #eee)'
    return `linear-gradient(to right, ${colors.join(', ')})`
}

function findPathToLeaf(node, targetId, path = []) {
    if (node == null) return null
    if (typeof node === 'string') {
        return node === targetId ? path : null
    }
    const leftPath = findPathToLeaf(node.first, targetId, path.concat('first'))
    if (leftPath) return leftPath
    return findPathToLeaf(node.second, targetId, path.concat('second'))
}

function FullScreenToggle({ tileId, onRestore, onRemember }) {
    const { mosaicActions } = React.useContext(MosaicContext)
    const { mosaicWindowActions } = React.useContext(MosaicWindowContext)
    const [isMaximized, setIsMaximized] = useState(false)

    const handleClick = () => {
        const path = mosaicWindowActions.getPath()
        if (isMaximized) {
            onRestore(tileId)
            setIsMaximized(false)
        } else {
            onRemember(tileId)
            mosaicActions.expand(path, 100)
            setIsMaximized(true)
        }
    }

    return (
        <button
            title={isMaximized ? 'Restore' : 'Maximize'}
            className={`bp3-button bp3-minimal ${isMaximized ? 'bp3-icon-minimize' : 'bp3-icon-maximize'}`}
            onClick={handleClick}
        />
    )
}

export default function App() {
    const initialTree = useMemo(() => createBalancedTreeFromLeaves(initialLeaves), [])
    const [tree, setTree] = useState(initialTree)
	const nextIdRef = useRef(1)
	const mosaicContainerRef = useRef(null)
	const createNode = () => {
		const newId = `new-${nextIdRef.current}`
		nextIdRef.current += 1
		return newId
	}
	const [sidebarWidth, setSidebarWidth] = useState(260)
    const [isResizingSidebar, setIsResizingSidebar] = useState(false)
    const [selectedOption, setSelectedOption] = useState('Option 1')
    const [numpyFiles, setNumpyFiles] = useState([])
    const [filesLoading, setFilesLoading] = useState(false)
    const [filesError, setFilesError] = useState(null)
    const [selectedFilename, setSelectedFilename] = useState('')
    const [selectedIndex0, setSelectedIndex0] = useState(0)
    const [fileDataCache, setFileDataCache] = useState({})
    const [tileHeatmapById, setTileHeatmapById] = useState({})
    const [colorScale, setColorScale] = useState('Viridis')
    const [showColorScale, setShowColorScale] = useState(true)
    const [isPaletteOpen, setIsPaletteOpen] = useState(false)
    const paletteRef = useRef(null)
    const previousTreesByIdRef = useRef(new Map())
    const [selectedTileId, setSelectedTileId] = useState(null)
    const [tileTextById, setTileTextById] = useState({})
	const tileBodyRefs = useRef(new Map())
	const setTileBodyRef = (id) => (el) => {
		if (el) {
			tileBodyRefs.current.set(id, el)
		} else {
			tileBodyRefs.current.delete(id)
		}
	}
    
    const splitSelectedTile = () => {
        if (!selectedTileId || !tree) return
        const path = findPathToLeaf(tree, selectedTileId)
        if (!path) return
        const newId = createNode()
        const tileEl = tileBodyRefs.current.get(selectedTileId)
		const rect = tileEl ? tileEl.getBoundingClientRect() : (mosaicContainerRef.current ? mosaicContainerRef.current.getBoundingClientRect() : null)
		const direction = rect && rect.height > rect.width ? 'column' : 'row'
        const newSubtree = {
            direction,
            first: selectedTileId,
            second: newId,
            splitPercentage: 50,
        }
        const nextTree = updateTree(tree, [{ path, spec: { $set: newSubtree } }])
        setTree(nextTree)
    }

    const rememberTreeFor = (id) => {
        // Save a deep clone to avoid accidental mutation
        previousTreesByIdRef.current.set(id, tree ? JSON.parse(JSON.stringify(tree)) : null)
    }

    const restoreTreeFor = (id) => {
        const prev = previousTreesByIdRef.current.get(id)
        if (prev !== undefined) {
            setTree(prev)
            previousTreesByIdRef.current.delete(id)
        }
    }

    useEffect(() => {
        let isCancelled = false
        const fetchFiles = async () => {
            try {
                setFilesLoading(true)
                setFilesError(null)
                const response = await fetch('http://localhost:8000/list-numpy-files')
                const data = await response.json()
                if (!isCancelled) {
                    if (data && Array.isArray(data.files)) {
                        setNumpyFiles(data.files)
                    } else if (data && data.error) {
                        setFilesError(String(data.error))
                        setNumpyFiles([])
                    } else {
                        setFilesError('Unexpected response from server')
                        setNumpyFiles([])
                    }
                }
            } catch (err) {
                if (!isCancelled) {
                    setFilesError(err?.message || 'Failed to fetch files')
                    setNumpyFiles([])
                }
            } finally {
                if (!isCancelled) setFilesLoading(false)
            }
        }
        fetchFiles()
        return () => {
            isCancelled = true
        }
    }, [])

    useEffect(() => {
        if (!selectedFilename && Array.isArray(numpyFiles) && numpyFiles.length > 0) {
            setSelectedFilename(numpyFiles[0].filename)
        } else if (Array.isArray(numpyFiles) && numpyFiles.length === 0) {
            setSelectedFilename('')
        }
    }, [numpyFiles, selectedFilename])

    const selectedFileInfo = useMemo(() => {
        if (!selectedFilename) return null
        return numpyFiles.find(f => f.filename === selectedFilename) || null
    }, [numpyFiles, selectedFilename])

    useEffect(() => {
        const dim0 = Array.isArray(selectedFileInfo?.shape) ? selectedFileInfo.shape[0] : 0
        if (dim0 <= 0) {
            setSelectedIndex0(0)
            return
        }
        if (selectedIndex0 < 0 || selectedIndex0 >= dim0) {
            setSelectedIndex0(0)
        }
    }, [selectedFileInfo, selectedIndex0])

    // Fetch and cache full numpy file data when a filename is selected
    useEffect(() => {
        if (!selectedFilename) return
        if (fileDataCache[selectedFilename]) return
        let isCancelled = false
        const fetchData = async () => {
            try {
                const resp = await fetch(`http://localhost:8000/load-numpy-file?filename=${encodeURIComponent(selectedFilename)}`)
                const json = await resp.json()
                if (!isCancelled && json && Array.isArray(json.data)) {
                    setFileDataCache((prev) => ({
                        ...prev,
                        [selectedFilename]: {
                            data: json.data,
                            shape: json.shape,
                            min: json.min,
                            max: json.max,
                        },
                    }))
                }
            } catch (e) {
                // ignore; left panel already indicates selection state
            }
        }
        fetchData()
        return () => { isCancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFilename])

    // Compute and assign heatmap to the currently selected tile
    useEffect(() => {
        if (!selectedTileId || !selectedFilename) return
        const fileEntry = fileDataCache[selectedFilename]
        if (!fileEntry) return
        const shape = Array.isArray(fileEntry.shape) ? fileEntry.shape : []
        let slice2d = null
        if (shape.length >= 3) {
            slice2d = fileEntry.data?.[selectedIndex0] ?? null
        } else if (shape.length === 2) {
            slice2d = fileEntry.data
        }
        if (!Array.isArray(slice2d)) return
        setTileHeatmapById((prev) => ({
            ...prev,
            [selectedTileId]: {
                z: slice2d,
                filename: selectedFilename,
                index0: selectedIndex0,
                min: fileEntry.min,
                max: fileEntry.max,
            },
        }))
        setTileTextById((prev) => ({ ...prev, [selectedTileId]: '' }))
    }, [selectedTileId, selectedFilename, selectedIndex0, fileDataCache])

    // Close palette menu on outside click / Escape
    useEffect(() => {
        if (!isPaletteOpen) return
        const onDocClick = (e) => {
            if (!paletteRef.current) return
            if (!paletteRef.current.contains(e.target)) {
                setIsPaletteOpen(false)
            }
        }
        const onKey = (e) => {
            if (e.key === 'Escape') setIsPaletteOpen(false)
        }
        document.addEventListener('mousedown', onDocClick)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', onDocClick)
            document.removeEventListener('keydown', onKey)
        }
    }, [isPaletteOpen])

	return (
		<div className="bp3-dark" style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
			{/* Top panel */}
            <div style={{ height: 44, display: 'flex', alignItems: 'center', padding: '0 8px', borderBottom: '1px solid #394b59', gap: 8 }}>
				<div className="bp3-select">
					<select value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
						<option>Option 1</option>
						<option>Option 2</option>
						<option>Option 3</option>
					</select>
				</div>
                <div className="bp3-select">
                    <select
                        aria-label="View"
                        value={showColorScale ? 'on' : 'off'}
                        onChange={(e) => setShowColorScale(e.target.value === 'on')}
                        title="View: Colorscale"
                    >
                        <option value="on">Colorscale: On</option>
                        <option value="off">Colorscale: Off</option>
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div ref={paletteRef} style={{ position: 'relative' }}>
                        <button
                            className="bp3-button bp3-outlined"
                            onClick={() => setIsPaletteOpen((v) => !v)}
                            title="Plotly color scale"
                        >
                            <span
                                aria-hidden
                                style={{
                                    display: 'inline-block',
                                    width: 80,
                                    height: 10,
                                    borderRadius: 2,
                                    border: '1px solid #394b59',
                                    background: cssGradientForPalette(colorScale),
                                    marginRight: 8,
                                    verticalAlign: 'middle',
                                }}
                            />
                            <span style={{ verticalAlign: 'middle' }}>{colorScale}</span>
                            <span className="bp3-icon bp3-icon-caret-down" style={{ marginLeft: 8 }} />
                        </button>
                        {isPaletteOpen && (
                            <div className="bp3-menu" style={{ position: 'absolute', zIndex: 20, top: '100%', left: 0, minWidth: 200, maxHeight: 280, overflowY: 'auto' }}>
                                {Object.keys(PALETTE_NAME_TO_COLORS).map((name) => (
                                    <div
                                        key={name}
                                        className={`bp3-menu-item${name === colorScale ? ' bp3-active' : ''}`}
                                        onClick={() => { setColorScale(name); setIsPaletteOpen(false) }}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setColorScale(name); setIsPaletteOpen(false) } }}
                                        title={name}
                                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                                    >
                                        <span
                                            aria-hidden
                                            style={{
                                                display: 'inline-block',
                                                width: 100,
                                                height: 10,
                                                borderRadius: 2,
                                                border: '1px solid #394b59',
                                                background: cssGradientForPalette(name),
                                            }}
                                        />
                                        <span>{name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
			</div>

			{/* Main content row */}
			<div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
				<Resizable
					width={sidebarWidth}
					height={0}
					axis="x"
					onResize={(e, data) => setSidebarWidth(data.size.width)}
					onResizeStart={() => setIsResizingSidebar(true)}
					onResizeStop={() => setIsResizingSidebar(false)}
					minConstraints={[160, 0]}
					maxConstraints={[600, 0]}
					handle={<span className={`sidebar-resize-handle ${isResizingSidebar ? 'is-resizing' : ''}`} />}
				>
                    <div style={{ position: 'relative', width: sidebarWidth, height: '100%', borderRight: '1px solid #394b59', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
                        
                        {/* <button className="bp3-button bp3-small" style={{ margin: 12 }} onClick={splitSelectedTile} disabled={!selectedTileId}>Split selected</button> */}
                        
                        <div style={{ margin: 8 }}>
                            <div className="bp3-select bp3-fill" style={{ marginBottom: 8 }}>
                                <select
                                    value={selectedFilename}
                                    onChange={(e) => setSelectedFilename(e.target.value)}
                                    disabled={filesLoading || (numpyFiles?.length ?? 0) === 0}
                                >
                                    {!selectedFilename && <option value="" disabled>{filesLoading ? 'Loading...' : ((numpyFiles?.length ?? 0) === 0 ? 'No files' : 'Select a file')}</option>}
                                    {numpyFiles.map((file) => (
                                        <option key={file.filename} value={file.filename}>{file.filename}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="bp3-select bp3-fill">
                                <select
                                    value={selectedIndex0}
                                    onChange={(e) => setSelectedIndex0(Number(e.target.value))}
                                    disabled={!selectedFileInfo || !Array.isArray(selectedFileInfo.shape) || (selectedFileInfo.shape[0] ?? 0) === 0}
                                >
                                    {(!selectedFileInfo || !Array.isArray(selectedFileInfo.shape) || (selectedFileInfo.shape[0] ?? 0) === 0) && (
                                        <option value={0} disabled>{!selectedFilename ? 'Select file first' : 'No indices'}</option>
                                    )}
                                    {Array.isArray(selectedFileInfo?.shape) && selectedFileInfo.shape[0] > 0 && (
                                        [...Array(selectedFileInfo.shape[0]).keys()].map((idx) => (
                                            <option key={idx} value={idx}>{idx}</option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>
        
					</div>
				</Resizable>
                <div ref={mosaicContainerRef} style={{ flex: 1, height: '100%' }} className="mosaic-blueprint-theme bp4-dark">
                <Mosaic
						value={tree}
						onChange={setTree}
						onRelease={setTree}
                    renderTile={(id, path) => (
						<MosaicWindow
							draggable={true}
                        title={`Tile ${id}`}
							path={path}
							createNode={createNode}
							toolbarControls={[
								<FullScreenToggle key={`fs-${id}`} tileId={id} onRemember={rememberTreeFor} onRestore={restoreTreeFor} />,
								<SplitButton key="split" />,
								<RemoveButton key="remove" />,
							]}
                        className={selectedTileId === id ? 'is-selected' : ''}
						>
                                <div
                                    ref={setTileBodyRef(id)}
                                    style={{ padding: 0, height: '100%', color: '#0a0a0F', whiteSpace: 'pre-wrap' }}
                                    onClick={() => setSelectedTileId(id)}
                                >
                                    {tileHeatmapById[id] ? (
                                        <Plot
                                            data={[{
                                                type: 'heatmap',
                                                z: tileHeatmapById[id].z,
                                                colorscale: colorScale,
                                                showscale: showColorScale,
                                                zmin: Number.isFinite(tileHeatmapById[id].min) ? tileHeatmapById[id].min : undefined,
                                                zmax: Number.isFinite(tileHeatmapById[id].max) ? tileHeatmapById[id].max : undefined,
                                            }]}
                                            layout={{
                                                margin: { l: 40, r: 10, t: 30, b: 40 },
                                                paper_bgcolor: 'rgba(0,0,0,0)',
                                                plot_bgcolor: 'rgba(0,0,0,0)',
                                                autosize: true,
                                                title: tileHeatmapById[id].filename + (Array.isArray(tileHeatmapById[id].z) ? ` [${tileHeatmapById[id].index0}]` : ''),
                                            }}
                                            useResizeHandler
                                            style={{ width: '100%', height: '100%' }}
                                            config={{ displayModeBar: false }}
                                        />
                                    ) : (
                                        <div style={{ padding: 12 }}>
                                            {(tileTextById[id] && tileTextById[id].trim().length > 0) ? tileTextById[id] : `Content for tile ${id}`}
                                        </div>
                                    )}
                                </div>
							</MosaicWindow>
						)}
					/>
				</div>
			</div>
		</div>
	)
}


