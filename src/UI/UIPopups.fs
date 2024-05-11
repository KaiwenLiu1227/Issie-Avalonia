module UIPopups

open Avalonia.FuncUI.DSL


let overlayView model dispatch =
    (*if model.IsOverlayVisible then
        Border.create [
            Border.background (SolidColorBrush(Color.FromArgb(128uy, 0uy, 0uy, 0uy))) // Semi-transparent background
            Border.child (
                    // Center align the content within the Border
                    StackPanel.create [
                        StackPanel.orientation Orientation.Vertical // Arrange buttons horizontally
                        StackPanel.horizontalAlignment HorizontalAlignment.Center // Center the StackPanel horizontally
                        StackPanel.verticalAlignment VerticalAlignment.Center // Center the StackPanel vertically
                        StackPanel.children [
                            ListBox.create [
                                ListBox.background (SolidColorBrush(Colors.White))
                                ListBox.width 500
                                ListBox.dataItems [
                                    "New Project"
                                    "Open Project"
                                    "Open Demo Project"
                                ]
                                ListBox.selectedItem model.projectState
                                ListBox.onSelectionChanged  (fun _ -> dispatch (ChangeProjState))
                            ]
                        ]
                    ]
                )
        ]
    else*)
    Border.create [] // Return an empty control when not visible
