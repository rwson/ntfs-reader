import path from 'path';
import PythonShell from 'python-shell';

const PYTHON_HOME = path.resolve(__dirname, 'python-module');

const moduleSuffix = (module) => {
	return /\.py$/.test(module) ? module : [module, 'py'].join('.');
};

const readFsTab = (module, args = []) => {
	module = moduleSuffix(module);
    const options = {
        mode: 'text',
        pythonPath: '/usr/bin/python',
        pythonOptions: ['-u'],
        scriptPath: PYTHON_HOME,
        args: ['readFsTab', ...args],
        childProcess: true
    };

    return new Promise((resolve) => {
    	PythonShell.run(module, options, (error, res) => {
    		if (error) {
    			resolve({
    				success: false,
    				...error
    			});
    		} else {
                res = res[0].split('-');
    			resolve({
    				success: true,
    				res
    			});
    		}
    	});
    });
};

const addToFsTab = (module, args = []) => {
    module = moduleSuffix(module);
    const options = {
        mode: 'text',
        pythonPath: '/usr/bin/python',
        pythonOptions: ['-u'],
        scriptPath: PYTHON_HOME,
        args: ['addToFsTab', ...args],
        childProcess: true
    };

    return new Promise((resolve) => {
        PythonShell.run(module, options, (error, res) => {
            if (error) {
                console.log(error);
                resolve({
                    success: false,
                    ...error
                });
            } else {
                resolve({
                    success: true,
                    res
                });
            }
        });
    });
};

const deleteFsTabItem = (module, args = []) => {
    module = moduleSuffix(module);
    const options = {
        mode: 'text',
        pythonPath: '/usr/bin/python',
        pythonOptions: ['-u'],
        scriptPath: PYTHON_HOME,
        args: ['deleteFsTabItem', ...args],
        childProcess: true
    };

    return new Promise((resolve) => {
        PythonShell.run(module, options, (error, res) => {
            if (error) {
                resolve({
                    success: false,
                    ...error
                });
            } else {
                resolve({
                    success: true,
                    res
                });
            }
        });
    });
};

export {
	readFsTab,
	addToFsTab,
    deleteFsTabItem
}