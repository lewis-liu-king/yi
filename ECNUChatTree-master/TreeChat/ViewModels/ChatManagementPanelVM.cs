using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using TreeChat.Commands;
using TreeChat.Models;
using TreeChat.Services;

namespace TreeChat.ViewModels
{
    public class ChatManagementPanelVM : BaseViewModel
    {
        private ObservableCollection<ChatTree> _chatList;
        private ChatTree? _selectedChat;
        private readonly IFileService _fileService;

        public ObservableCollection<ChatTree> ChatList
        {
            get => _chatList;
        }

        public ChatTree? SelectedChat
        {
            get => _selectedChat;
            set
            {
                SetProperty(ref _selectedChat, value);
                if (value != null)
                    SelectedChatChanged?.Invoke(value);

                SaveChat.OnCanExecuteChanged();
                RenameChat.OnCanExecuteChanged();
            }
        }

        public RelayCommand CreateNewChat { get; }
        public RelayCommand SaveChat { get; }
        public RelayCommand LoadChat { get; }
        public RelayCommand RenameChat { get; }

        public event Action<ChatTree>? SelectedChatChanged;

        public ChatManagementPanelVM()
        {
            _chatList = new ObservableCollection<ChatTree>();
            _fileService = new FileService();

            CreateNewChat = new RelayCommand(ExecuteCreateNewChat);
            SaveChat = new RelayCommand(ExecuteSaveChat, CanExecuteSaveChat);
            LoadChat = new RelayCommand(ExecuteLoadChat);
            RenameChat = new RelayCommand(ExecuteRenameChat, CanExecuteRenameChat);
        }

        private void ExecuteCreateNewChat(object? parameter)
        {
            var configDialog = new Views.ConfigDialog();
            if (configDialog.ShowDialog() == true)
            {
                ChatTree newTree = new ChatTree(
                    apiKey: configDialog.ApiKey,
                    apiEndpoint: configDialog.ApiEndpoint,
                    modelName: configDialog.ModelName,
                    temperature: configDialog.Temperature,
                    topP: configDialog.TopP,
                    topK: configDialog.TopK
                );
                ChatList.Add(newTree);
                SelectedChat = newTree;
            }
        }

        private bool CanExecuteSaveChat(object? parameter)
        {
            return SelectedChat != null;
        }

        private void ExecuteSaveChat(object? parameter)
        {
            if (SelectedChat == null) return;

            bool success = _fileService.SaveChatTree(SelectedChat);
            if (success)
            {
                MessageBox.Show("保存成功！", "提示",
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private void ExecuteLoadChat(object? parameter)
        {
            var loadedTree = _fileService.LoadChatTree();
            if (loadedTree != null)
            {
                ChatList.Add(loadedTree);
                SelectedChat = loadedTree;
            }
        }

        public void LoadChatFromPath(string filePath)
        {
            var loadedTree = _fileService.LoadChatTree(filePath);
            if (loadedTree != null)
            {
                ChatList.Add(loadedTree);
                SelectedChat = loadedTree;
            }
        }

        private bool CanExecuteRenameChat(object? parameter)
        {
            return SelectedChat != null;
        }

        private void ExecuteRenameChat(object? parameter)
        {
            if (SelectedChat == null) return;

            var dialog = new Views.RenameDialog(SelectedChat.TreeTitle);
            if (dialog.ShowDialog() == true)
            {
                string newName = dialog.NewName;
                if (!string.IsNullOrWhiteSpace(newName))
                {
                    SelectedChat.TreeTitle = newName;

                    int index = ChatList.IndexOf(SelectedChat);
                    if (index >= 0)
                    {
                        ChatList[index] = SelectedChat;
                    }
                }
            }
        }
    }
}