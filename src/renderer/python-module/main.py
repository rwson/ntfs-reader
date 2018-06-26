import sys
import json
import fstab

fstabPath = '/etc/fstab'

def row(rowName):
	row = []
	row.append('LABEL=')
	row.append(rowName)
	row.append(' none ntfs rw,auto,nobrowse')
	return row.join('')



for v in sys.argv[1:]:

	if v == 'readFsTab':
		lines = []
		fs = fstab.Fstab()
		fs.read(fstabPath)
		for line in fs.lines:
			lines.append(line.get_raw().split(' ')[0].split('=')[1])
		print('-'.join(lines))

	if v == 'addToFsTab':
		print('fuck add')

	if v == 'deleteFsTabItem':
		print('fuck delete')


