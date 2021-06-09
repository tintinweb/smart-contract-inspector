import { useEffect, useMemo, useState } from 'react';

import { useDropzone } from 'react-dropzone'

const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 10,
    borderColor: 'rgb(107, 114, 128)',
    borderStyle: 'dashed',
    color: 'rgb(107, 114, 128)',
    outline: 'none',
    transition: 'border .24s ease-in-out',
    fontSize: "18px"
};


const activeStyle = {
    borderColor: '#2196f3'
};

const acceptStyle = {
    borderColor: '#00e676'
};

const rejectStyle = {
    borderColor: '#ff1744'
};

export const FileSelector = ({ onFileChange, ...props }) => {
    const [ignored, setIgnored] = useState({})
    const [ignoredExpressions, setIgnoredExpressions] = useState(["node_modules", "mock", "interface", "Migrations", "test", "package","truffle-config"])
    const [mustIncludeExpression, setmustIncludeExpression] = useState(["build/contracts"])
    const [filteredFiles, setFilteredFiles] = useState()
    const {
        acceptedFiles,
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject,
        fileRejections
    } = useDropzone({ accept: '.json' });

    const style = useMemo(() => ({
        ...baseStyle,
        ...(isDragActive ? activeStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [
        isDragActive,
        isDragReject,
        isDragAccept
    ]);

    useEffect(() => {
        const filteredFiles = acceptedFiles
        .filter(({ path }) => {
            const mustIncludeFiles = mustIncludeExpression.filter(includeExpression => (path.indexOf(includeExpression) > -1))
            return mustIncludeFiles.length > 0
        })
        .filter(({ path }) => {
            const ignoredFiles = ignoredExpressions.filter(ignoredExpression => (path.indexOf(ignoredExpression) > -1))
            return !ignoredFiles.length > 0
        })

        setIgnored({
            solidity: acceptedFiles.length - filteredFiles.length,
            nonSolidity: fileRejections && fileRejections.length
        })

        setFilteredFiles(filteredFiles.length)

        onFileChange(Array.from(filteredFiles))
        console.log(Array.from(filteredFiles))
    }, [acceptedFiles, ignoredExpressions])

    return (
        <section className="container">

            <div {...getRootProps({ className: 'dropzone mt-8 mb-2', style })}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop your project folder here, or click to select files</p>
            </div>

            {filteredFiles === 0 ? <p className="sub-paragraph">No file matched the filter criteria. Make sure <i>.sol</i> were uploaded and check the ignore expressions.</p> : <></>}
            {(ignored.nonSolidity && ignored.nonSolidity > 0) ? <p className="sub-paragraph">{ignored.nonSolidity} not .json files skipped.</p> : <></>}
            {(ignored.solidity && ignored.solidity > 0) ? <p className="sub-paragraph">{ignored.solidity} <i>.json</i> files skipped due to ignore expressions.</p> : <></>}


        </section>
    );
}