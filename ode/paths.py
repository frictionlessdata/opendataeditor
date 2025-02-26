import os

from pathlib import Path


class Paths:
    """Utility class to handle relative paths."""
    base = os.path.dirname(__file__)
    assets = os.path.join(base, "assets")

    # This is the Project path where all files are stored and
    # it will be hardcoded to the home folder of the user until
    # we define how to properly handle projects in Open Data Editor.
    PROJECT_PATH = Path.home() / '.opendataeditor/tmp'
    METADATA_PATH = PROJECT_PATH / '.metadata'

    @classmethod
    def asset(cls, filename):
        return os.path.join(cls.assets, filename)

    @classmethod
    def translation(cls, filename):
        return os.path.join(cls.assets, "translations", filename)

    @classmethod
    def get_path_to_metadata_file(cls, filepath: str|Path) -> Path:
        """Returns the path to the metadata file of the given file.

        Metadata is a JSON object that stores Fricionless Metadata and any other
        metadata required by ODE. All metadata files are going to be stored in a
        `.metadata` folder mimicing the file name and the structure of the project
        folder.

        Example 1:
          - File: Paths.PROJECT_FOLDER / 'myfile.csv'
          - Metadata: Paths.PROJECT_FOLDER / '.metadata/myfile.json'

        Example 2 (subfolder):
          - File: Paths.PROJECT_FOLDER / 'subfolder/invalid-file.csv'
          - Metadata: Paths.PROJECT_FOLDER / '.metadata/subfolder/invalid-file.json'
        """
        filepath = Path(filepath) if isinstance(filepath, str) else filepath
        relative_path = filepath.parent.relative_to(cls.PROJECT_PATH)
        metadata_path = cls.METADATA_PATH / relative_path
        metadata_filepath = metadata_path / (filepath.stem + '.json')
        return metadata_filepath