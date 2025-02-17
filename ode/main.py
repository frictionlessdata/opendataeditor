import sys
import ode
import os

from pathlib import Path
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QGridLayout, QVBoxLayout, QHBoxLayout,
    QTreeView, QPushButton, QLabel, QStackedLayout, QTableView,
    QComboBox, QMenu, QMessageBox, QInputDialog, QProgressDialog
)

from PySide6.QtGui import QPixmap, QIcon, QDesktopServices, QAction
from PySide6.QtCore import Qt, QSize, QFileInfo, QTranslator, QFile, QTextStream, QThreadPool, Slot
# https://bugreports.qt.io/browse/PYSIDE-1914
from PySide6.QtWidgets import QFileSystemModel

from ode.paths import Paths
from ode.panels.errors import ErrorsWidget
from ode.panels.metadata import FrictionlessResourceMetadataWidget
from ode.panels.data import FrictionlessTableModel, DataWorker
from ode.panels.source import SourceViewer
from ode.panels.ai import ChatGPTDialog
from ode.dialogs.upload import DataUploadDialog
from ode.utils import migrate_metadata_store


class Sidebar(QWidget):
    """Widget containing the left sidebar of ODE.

    This class is responsible for:
     - Rendering all the components of the Sidebar.
     - All the logic of the context menu of the File Navigator.
    """
    def __init__(self, parent):
        super().__init__(parent=parent)
        self.setFixedWidth(300)
        layout = QVBoxLayout()

        icon_label = QLabel()
        pixmap = QPixmap(Paths.asset("logo.svg"))
        icon_label.setPixmap(pixmap)
        icon_label.setAlignment(Qt.AlignmentFlag.AlignLeft)

        self.upload_dialog = DataUploadDialog(self)
        self.button_upload = QPushButton(objectName="button_upload")

        self.file_navigator = QTreeView()
        self.file_model = QFileSystemModel()
        self.file_navigator.setModel(self.file_model)
        self.file_navigator.setRootIndex(self.file_model.setRootPath(str(Paths.PROJECT_PATH)))
        self._show_only_name_column_in_file_navigator(self.file_model, self.file_navigator)
        self.file_navigator.setHeaderHidden(True)
        self.file_navigator.setContextMenuPolicy(Qt.CustomContextMenu)
        self.file_navigator.customContextMenuRequested.connect(self._show_context_menu)
        self._setup_file_navigator_context_menu()

        self.user_guide = QPushButton()
        self.user_guide.setIcon(QIcon(Paths.asset("icons/24/menu-book.svg")))
        self.user_guide.setIconSize(QSize(20, 20))
        self.user_guide.setStyleSheet("text-align: left;")

        self.report_issue = QPushButton()
        self.report_issue.setIcon(QIcon(Paths.asset("icons/24/report-issue.svg")))
        self.report_issue.setIconSize(QSize(20, 20))
        self.report_issue.setStyleSheet("text-align: left;")

        self.language = QComboBox()
        options = [
            ("English", ""),
            ("Français", "fr"),
            ("Español", "es"),
            ("Português", "pt"),
        ]
        language_icon = QIcon(Paths.asset("icons/24/language.svg"))
        for i, (text, locale) in enumerate(options):
            self.language.addItem(text)
            self.language.setItemData(i, locale)
            self.language.setItemIcon(i, language_icon)
        self.language.setStyleSheet("text-align: left;")

        layout.addWidget(icon_label)
        layout.addWidget(self.button_upload)
        layout.addWidget(self.file_navigator)
        layout.addWidget(self.user_guide)
        layout.addWidget(self.report_issue)
        layout.addWidget(self.language)

        self.setLayout(layout)

    def retranslateUI(self):
        """Apply translations to class elements."""
        self.button_upload.setText(self.tr("Upload your data"))
        self.user_guide.setText(self.tr("User guide"))
        self.report_issue.setText(self.tr("Report an issue"))
        self.rename_action.setText(self.tr("Rename"))
        self.open_location_action.setText(self.tr("Open File in Location"))
        self.delete_action.setText(self.tr("Delete"))
        self.upload_dialog.retranslateUI()

    def _setup_file_navigator_context_menu(self):
        """Create the context menu for the file navigator."""
        self.context_menu = QMenu(self)

        self.rename_action = QAction()
        self.open_location_action = QAction()
        self.delete_action = QAction()

        self.rename_action.triggered.connect(self._rename_file_navigator_item)
        self.open_location_action.triggered.connect(self._open_file_navigator_location)
        self.delete_action.triggered.connect(self._delete_file_navitagor_item)

        self.context_menu.addAction(self.rename_action)
        self.context_menu.addAction(self.open_location_action)
        self.context_menu.addAction(self.delete_action)

    def _show_context_menu(self, position):
        """Show the context menu for a specific index at the specific position."""
        index = self.file_navigator.indexAt(position)
        if index.isValid():
            global_pos = self.file_navigator.viewport().mapToGlobal(position)
            self.context_menu.exec(global_pos)

    def _rename_file_navigator_item(self):
        """Ask user for the new name for the selected file/folder."""
        index = self.file_navigator.currentIndex()
        if index.isValid():
            file_path = Path(self.file_model.filePath(index))
            if file_path.is_file():
                name = file_path.stem
                extension = file_path.suffix
            elif file_path.is_dir():
                name = file_path.name
                extension = ""

            new_name, ok = QInputDialog.getText(
                self, self.tr("Rename"), self.tr("Enter new name:"), text=name
            )
            if ok and new_name:
                new_path = os.path.join(os.path.dirname(file_path), new_name + extension)
                try:
                    os.rename(file_path, new_path)
                except IsADirectoryError:
                    QMessageBox.warning(
                        self, self.tr("Error"), self.tr("Source is a file but destination a directory.")
                    )
                except NotADirectoryError:
                    QMessageBox.warning(
                        self, self.tr("Error"), self.tr("Source is a directory but destination a file."))
                except PermissionError:
                    # Since we have a managed PROJECT_PATH this should never happen.
                    QMessageBox.warning(self, self.tr("Error"), self.tr("Operation not permitted."))
                except OSError as e:
                    QMessageBox.warning(self, self.tr("Error"), self.tr("Error: {e}").format(e))

    def _open_file_navigator_location(self):
        """Open the folder where the file lives using the OS application."""
        index = self.file_navigator.currentIndex()
        if index.isValid():
            path = self.file_model.filePath(index)
            folder = os.path.dirname(path)
            if sys.platform == "win32":
                os.system(f'explorer.exe "{folder}"')
            elif sys.platform == "darwin":
                os.system(f'open "{folder}"')
            else:
                os.system(f'xdg-open "{folder}"')

    def _delete_file_navitagor_item(self):
        """Delete a file/folder from the file navigator (and the OS)."""
        index = self.file_navigator.currentIndex()
        if index.isValid():
            file_path = self.file_model.filePath(index)

            confirm = QMessageBox.question(
                self, self.tr("Delete"), self.tr("Are you sure you want to delete this?"),
                QMessageBox.Yes | QMessageBox.No
            )
            if confirm == QMessageBox.Yes:
                try:
                    if os.path.isfile(file_path):
                        os.remove(file_path)
                    elif os.path.isdir(file_path):
                        os.rmdir(file_path)
                except OSError as e:
                    QMessageBox.warning(self, self.tr("Error"), self.tr("Failed to delete: {e}").format(e))

    def _show_only_name_column_in_file_navigator(self, file_model, file_navigator):
        """Hide all columns except for the name column (column 0)"""
        for column in range(file_model.columnCount()):
            if column != 0:  # 0 is the name column
                file_navigator.setColumnHidden(column, True)


class Toolbar(QWidget):
    """Widget containing ODE's toolbar.

    The toolbar contains:
     - Buttons that allow the user to navigate between the panels (Data, Metadata, Errors,
     Source, etc)
     - Buttons for the main actions like AI, Publish and Save.
    """
    def __init__(self, parent):
        super().__init__(parent=parent)
        layout = QHBoxLayout()
        layout.setSpacing(10)

        # Buttons on the left
        self.button_data = QPushButton()
        self.button_metadata = QPushButton()
        self.button_metadata.setIcon(QIcon(Paths.asset("icons/24/tune.svg")))
        self.button_metadata.setIconSize(QSize(20, 20))
        self.button_errors = QPushButton()
        self.button_errors.setIcon(QIcon(Paths.asset("icons/24/rule.svg")))
        self.button_errors.setIconSize(QSize(20, 20))
        self.button_source = QPushButton()
        self.button_source.setIcon(QIcon(Paths.asset("icons/24/code.svg")))
        self.button_source.setIconSize(QSize(20, 20))
        layout.addWidget(self.button_data)
        layout.addWidget(self.button_metadata)
        layout.addWidget(self.button_errors)
        layout.addWidget(self.button_source)

        # Spacer to push right-side buttons to the end
        layout.addStretch()

        # Buttons on the right
        self.button_ai = QPushButton()
        self.button_ai.setIcon(QIcon(Paths.asset("icons/24/wand.svg")))
        self.button_ai.setIconSize(QSize(20, 20))
        self.button_publish = QPushButton(objectName="button_publish")
        self.button_publish.setIcon(QIcon(Paths.asset("icons/24/electric-bolt.svg")))
        self.button_publish.setIconSize(QSize(20, 20))
        self.button_save = QPushButton(objectName="button_save")
        self.button_save.setMinimumSize(QSize(117, 35))
        self.button_save.setIcon(QIcon(Paths.asset("icons/24/check.svg")))
        self.button_save.setIconSize(QSize(20, 20))
        # update_qss_button = QPushButton("QSS")
        # update_qss_button.clicked.connect(self.apply_stylesheet)
        # layout.addWidget(update_qss_button)
        layout.addWidget(self.button_ai)
        layout.addWidget(self.button_publish)
        layout.addWidget(self.button_save)

        self.setLayout(layout)

    def retranslateUI(self):
        """Apply translations to class elements."""
        self.button_data.setText(self.tr("Data"))
        self.button_metadata.setText(self.tr("Metadata"))
        self.button_errors.setText(self.tr("Errors Report"))
        self.button_source.setText(self.tr("Source"))
        self.button_publish.setText(self.tr("Publish"))
        self.button_save.setText(self.tr("Save changes"))
        self.button_ai.setText(self.tr("AI"))


class MainWindow(QMainWindow):
    """Main Window of the Open Data Editor.

    This class is also the main Controller of the application with two reponsibilites:
     - Connect signals/slots of all widgets and elements (including children).
     - Handle custom logic that that requires children interactions with each other.
    """
    def __init__(self):
        super().__init__()

        self.setWindowTitle("Open Data Editor")
        icon = QIcon(Paths.asset('icons/icon.png'))
        self.setWindowIcon(icon)

        self.threadpool = QThreadPool()
        # TODO: Review this decision
        self.selected_file_path = ""

        central_widget = QWidget()
        layout = QGridLayout()
        central_widget.setLayout(layout)
        self.setCentralWidget(central_widget)

        self.sidebar = Sidebar(self)
        layout.addWidget(self.sidebar, 0, 0, 2, 1)  # Span 2 rows

        self.toolbar = Toolbar(self)
        layout.addWidget(self.toolbar, 0, 1)

        self.content = QWidget(self)
        self.stacked_layout = QStackedLayout()
        self.content.setLayout(self.stacked_layout)

        self.data_view = QTableView()
        self.metadata_widget = FrictionlessResourceMetadataWidget()
        self.errors_view = ErrorsWidget()
        self.source_view = SourceViewer()
        self.ai_widget = ChatGPTDialog(self)

        self.stacked_layout.addWidget(self.data_view)
        self.stacked_layout.addWidget(self.metadata_widget)
        self.stacked_layout.addWidget(self.errors_view)
        self.stacked_layout.addWidget(self.source_view)

        layout.addWidget(self.content, 1, 1)

        self._menu_bar()

        # Handle Slot/Signals
        self.sidebar.button_upload.clicked.connect(self.on_button_upload_click)
        self.sidebar.file_navigator.clicked.connect(self.on_tree_click)
        self.sidebar.user_guide.clicked.connect(self.open_user_guide)
        self.sidebar.report_issue.clicked.connect(self.open_report_issue)
        self.sidebar.language.activated.connect(self.on_language_change)

        self.toolbar.button_save.clicked.connect(self.on_save_click)
        self.toolbar.button_ai.clicked.connect(self.on_ai_click)
        self.toolbar.button_data.clicked.connect(lambda: self.stacked_layout.setCurrentIndex(0))
        self.toolbar.button_metadata.clicked.connect(lambda: self.stacked_layout.setCurrentIndex(1))
        self.toolbar.button_errors.clicked.connect(lambda: self.stacked_layout.setCurrentIndex(2))
        self.toolbar.button_source.clicked.connect(lambda: self.stacked_layout.setCurrentIndex(3))

        # Translation
        self.translator = QTranslator()
        self.retranslateUI()

        self.apply_stylesheet()

    def _menu_bar(self):
        """Creates the menu bar and assign all its actions.

        Names and titles are going to be set in retranslateUI.
        """
        self.menu_file = QMenu()
        self.action_upload_file = QAction()
        self.menu_file.addAction(self.action_upload_file)
        self.menuBar().addMenu(self.menu_file)

        self.menu_edit = QMenu()
        self.menuBar().addMenu(self.menu_edit)

        self.menu_view = QMenu()
        self.menuBar().addMenu(self.menu_view)

        self.menu_help = QMenu()
        self.menuBar().addMenu(self.menu_help)

    def apply_stylesheet(self):
        """Reads our main style QSS file and applies it to the application.

        Tip: this method can be connected to a button to live reload changes.
        """
        qss_file = QFile(Paths.asset("style.qss"))
        qss_file.open(QFile.ReadOnly)
        qss_content = QTextStream(qss_file).readAll()
        self.setStyleSheet(qss_content)

    def on_ai_click(self):
        self.ai_widget.show()

    def retranslateUI(self):
        """Set the text of all the UI elements using a translation function.

        retranslateUI is a pattern used in Qt to handle the dynamic updates
        of languages. All text that needs to be translated needs to be set inside
        this function so we can call it to refresh the UI.

        This method should be call when:
          a) The application is load for the first time (MainWindow.__init__)
          b) Every time the user selects a different language (language ComboBox)
          c) An event related to language change is fired (like the user changing
          the language in the OS. Not Implemented yet).
        """
        # Update translated text for menus
        self.menu_file.setTitle(self.tr("File"))
        self.action_upload_file.setText(self.tr("Open"))
        self.menu_edit.setTitle(self.tr("Edit"))
        self.menu_view.setTitle(self.tr("View"))
        self.menu_help.setTitle(self.tr("Help"))

        # Hook retranslateUI for main widgets
        self.sidebar.retranslateUI()
        self.toolbar.retranslateUI()

        # Hook retranslateUI for all panels (data, errors, metadata, etc)
        self.errors_view.retranslateUI()
        self.ai_widget.retranslateUI()
        self.source_view.retranslateUI()

    def on_language_change(self, index):
        """Gets a *.qm translation file and calls retranslateUI.

        Translation files are generated using Qt tools pyside6-lupdate and
        pyside6-lrelease.
        """
        locale = self.sidebar.language.itemData(index)
        app = QApplication.instance()
        if not locale:
            app.removeTranslator(self.translator)
            self.retranslateUI()
            return

        filename = locale + ".qm"
        filepath = Paths.translation(filename)
        if self.translator.load(filepath):
            app.installTranslator(self.translator)
        else:
            print(f"Error when loading {filepath} translator file. Fallbacking to English.")
            app.removeTranslator(self.translator)
        self.retranslateUI()

    def on_button_upload_click(self):
        """Copy data file to the project folder of ode."""
        self.sidebar.upload_dialog.show()

    def on_save_click(self, checked):
        """Saves changes made in the Table View into the file.

        # TODO: This is an early implementation, we need to define
        signals and slots properly.
        """
        if not hasattr(self, 'table_model'):
            # TODO: Define behaviour of Save Button
            return
        self.table_model.write_data(self.selected_file_path)
        self.table_model.layoutChanged.emit()
        self.metadata_widget.save_metadata_to_descriptor_file()

    @Slot(tuple)
    def update_views(self, worker_data):
        """Update all the main views with the data provided by the read worker.

        This method is connected to the data widget Worker's signal and it will
        receive the data, the frictionless report and a list of errors.
        """
        filepath, data, errors = worker_data
        self.table_model = FrictionlessTableModel(data, errors)
        self.data_view.setModel(self.table_model)
        self.errors_view.display_errors(errors, self.table_model)
        self.metadata_widget.populate_all_forms(filepath)
        self.source_view.open_file(filepath)
        # Always focus back to the data view.
        self.stacked_layout.setCurrentIndex(0)
        self.progress_dialog.close()

    def on_tree_click(self, index):
        """ Handle reading tabular data on file selection

        This method will be triggered when the user clicks on a file in the
        QTreeView. It will create a Worker to read data in the background and display
        a ProgressDialog if it is taking too long. Reading with a worker is
        a requirement to display a proper QProgressDialog.
        """
        self.selected_file_path = self.sender().model().filePath(index)
        info = QFileInfo(self.selected_file_path)
        if info.isFile() and info.suffix() in ['csv', 'xls', 'xlsx']:
            worker = DataWorker(self.selected_file_path)
            worker.signals.finished.connect(self.update_views)
            self.progress_dialog = QProgressDialog(
                self.tr("Given the file size this operation might take some time..."), None, 0, 0, self
            )
            self.progress_dialog.setWindowModality(Qt.WindowModal)
            self.progress_dialog.setValue(0)               # Start counting and,
            self.progress_dialog.setMinimumDuration(1000)  # show only if task takes more than 1000ms
            self.threadpool.start(worker)
        else:
            print("Selected file is not supported...")
            self.clear_views()

    def clear_views(self):
        """Set all panels to its default state."""
        print("Clearing views...")
        self.table_model = FrictionlessTableModel([], [])
        self.data_view.setModel(self.table_model)
        # self.metadata_view.clear()  # TODO: Implement
        self.errors_view.clear()
        self.source_view.clear()

    def open_user_guide(self):
        QDesktopServices.openUrl("https://opendataeditor.okfn.org/documentation/getting-started/")

    def open_report_issue(self):
        QDesktopServices.openUrl("https://github.com/okfn/opendataeditor")


if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setApplicationName("Open Data Editor")
    app.setApplicationVersion(ode.__version__)

    # Migration to ODE 1.4
    migrate_metadata_store()

    window = MainWindow()
    window.showMaximized()
    window.show()
    sys.exit(app.exec())
