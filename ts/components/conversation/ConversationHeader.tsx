import React from 'react';

import { Avatar } from '../Avatar';
import { Colors, LocalizerType } from '../../types/Util';
import {
  ContextMenu,
  ContextMenuTrigger,
  MenuItem,
  SubMenu,
} from 'react-contextmenu';

import {
  SessionIconButton,
  SessionIconSize,
  SessionIconType,
} from '../session/icon';

import {
  SessionButton,
  SessionButtonColor,
  SessionButtonType,
} from '../session/SessionButton';

export interface TimerOption {
  name: string;
  value: number;
}

interface Props {
  id: string;
  name?: string;

  phoneNumber: string;
  profileName?: string;
  color: string;
  avatarPath?: string;

  isVerified: boolean;
  isMe: boolean;
  isClosable?: boolean;
  isGroup: boolean;
  isArchived: boolean;
  isPublic: boolean;
  isRss: boolean;
  amMod: boolean;

  members: Array<any>;

  expirationSettingName?: string;
  showBackButton: boolean;
  timerOptions: Array<TimerOption>;
  hasNickname?: boolean;

  isBlocked: boolean;
  isFriend: boolean;
  isFriendRequestPending: boolean;
  isOnline?: boolean;

  selectedMessages: any;

  onSetDisappearingMessages: (seconds: number) => void;
  onDeleteMessages: () => void;
  onDeleteContact: () => void;
  onResetSession: () => void;

  onCloseOverlay: () => void;
  onDeleteSelectedMessages: () => void;

  onArchive: () => void;
  onMoveToInbox: () => void;

  onShowSafetyNumber: () => void;
  onShowAllMedia: () => void;
  onShowGroupMembers: () => void;
  onGoBack: () => void;

  onBlockUser: () => void;
  onUnblockUser: () => void;

  onClearNickname: () => void;
  onChangeNickname: () => void;

  onCopyPublicKey: () => void;

  onUpdateGroup: () => void;
  onLeaveGroup: () => void;
  onAddModerators: () => void;
  onRemoveModerators: () => void;
  onInviteFriends: () => void;
  onAvatarClick?: (userPubKey: string) => void;

  i18n: LocalizerType;
}

export class ConversationHeader extends React.Component<Props> {
  public showMenuBound: (event: React.MouseEvent<HTMLDivElement>) => void;
  public onAvatarClickBound: (userPubKey: string) => void;
  public menuTriggerRef: React.RefObject<any>;

  public constructor(props: Props) {
    super(props);

    this.menuTriggerRef = React.createRef();
    this.showMenuBound = this.showMenu.bind(this);
    this.onAvatarClickBound = this.onAvatarClick.bind(this);
  }

  public showMenu(event: React.MouseEvent<HTMLDivElement>) {
    if (this.menuTriggerRef.current) {
      this.menuTriggerRef.current.handleContextClick(event);
    }
  }

  public renderBackButton() {
    const { onGoBack, showBackButton } = this.props;

    if (!showBackButton) {
      return null;
    }

    return (
      <div
        onClick={onGoBack}
        role="button"
        className="module-conversation-header__back-icon"
      />
    );
  }

  public renderTitle() {
    const {
      phoneNumber,
      i18n,
      profileName,
      isFriend,
      isGroup,
      isRss,
      members,
      isFriendRequestPending,
      isMe,
      name,
    } = this.props;

    if (isMe) {
      return (
        <div className="module-conversation-header__title">
          {i18n('noteToSelf')}
        </div>
      );
    }

    let text = '';
    if (isFriendRequestPending) {
      text = i18n('pendingAcceptance');
    } else if (!isFriend && !isGroup) {
      text = i18n('notFriends');
    } else if (isGroup && !isRss && members.length > 0) {
      const count = String(members.length);
      text = i18n('members', [count]);
    }

    const textEl =
      text === '' ? null : (
        <span className="module-conversation-header__title-text">{text}</span>
      );

    let title;
    if (profileName) {
      title = `${profileName} ${window.shortenPubkey(phoneNumber)}`;
    } else {
      if (name) {
        title = `${name}`;
      } else {
        title = phoneNumber;
      }
    }

    return (
      <div className="module-conversation-header__title">
        <span className="module-contact-name__profile-name">{title}</span>
        {textEl}
      </div>
    );
  }

  public renderAvatar() {
    const {
      avatarPath,
      color,
      i18n,
      isGroup,
      isMe,
      name,
      phoneNumber,
      profileName,
      isOnline,
    } = this.props;

    const borderColor = isOnline ? Colors.ONLINE : Colors.OFFLINE_LIGHT;
    const conversationType = isGroup ? 'group' : 'direct';

    return (
      <span className="module-conversation-header__avatar">
        <Avatar
          avatarPath={avatarPath}
          color={color}
          conversationType={conversationType}
          i18n={i18n}
          noteToSelf={isMe}
          name={name}
          phoneNumber={phoneNumber}
          profileName={profileName}
          size={28}
          borderColor={borderColor}
          borderWidth={2}
          onAvatarClick={() => {
            this.onAvatarClickBound(phoneNumber);
          }}
        />
      </span>
    );
  }

  public renderExpirationLength() {
    const { expirationSettingName } = this.props;

    if (!expirationSettingName) {
      return null;
    }

    return (
      <div className="module-conversation-header__expiration">
        <div className="module-conversation-header__expiration__clock-icon" />
        <div className="module-conversation-header__expiration__setting">
          {expirationSettingName}
        </div>
      </div>
    );
  }

  public renderSearch() {
    return (
      <div className="search-icon">
        <SessionIconButton
          iconType={SessionIconType.Search}
          iconSize={SessionIconSize.Large}
          iconPadded={true}
        />
      </div>
    );
  }

  public renderOptions(triggerId: string) {
    const { showBackButton } = this.props;

    if (showBackButton) {
      return null;
    }

    return (
      <ContextMenuTrigger
        id={triggerId}
        ref={this.menuTriggerRef}
        holdToDisplay={1}
      >
        <SessionIconButton
          iconType={SessionIconType.Ellipses}
          iconSize={SessionIconSize.Large}
          onClick={this.showMenuBound}
        />
      </ContextMenuTrigger>
    );
  }

  public renderMenu(triggerId: string) {
    const {
      i18n,
      isMe,
      isClosable,
      isPublic,
      isRss,
      isGroup,
      amMod,
      onDeleteMessages,
      onDeleteContact,
      onCopyPublicKey,
      onUpdateGroup,
      onLeaveGroup,
      onAddModerators,
      onRemoveModerators,
      onInviteFriends,
    } = this.props;

    const isPrivateGroup = isGroup && !isPublic && !isRss;

    const copyIdLabel = isGroup ? i18n('copyChatId') : i18n('copyPublicKey');

    return (
      <ContextMenu id={triggerId}>
        {this.renderPublicMenuItems()}
        <MenuItem onClick={onCopyPublicKey}>{copyIdLabel}</MenuItem>
        <MenuItem onClick={onDeleteMessages}>{i18n('deleteMessages')}</MenuItem>
        {isPrivateGroup || amMod ? (
          <MenuItem onClick={onUpdateGroup}>{i18n('updateGroup')}</MenuItem>
        ) : null}
        {amMod ? (
          <MenuItem onClick={onAddModerators}>{i18n('addModerators')}</MenuItem>
        ) : null}
        {amMod ? (
          <MenuItem onClick={onRemoveModerators}>
            {i18n('removeModerators')}
          </MenuItem>
        ) : null}
        {isPrivateGroup ? (
          <MenuItem onClick={onLeaveGroup}>{i18n('leaveGroup')}</MenuItem>
        ) : null}
        {/* TODO: add delete group */}
        {isGroup && isPublic ? (
          <MenuItem onClick={onInviteFriends}>{i18n('inviteFriends')}</MenuItem>
        ) : null}
        {!isMe && isClosable && !isPrivateGroup ? (
          !isPublic ? (
            <MenuItem onClick={onDeleteContact}>
              {i18n('deleteContact')}
            </MenuItem>
          ) : (
            <MenuItem onClick={onDeleteContact}>
              {i18n('deletePublicChannel')}
            </MenuItem>
          )
        ) : null}
      </ContextMenu>
    );
  }

  public renderSelectionOverlay() {
    const { onDeleteSelectedMessages, onCloseOverlay, i18n } = this.props;

    return (
      <div className="message-selection-overlay">
        <div className="close-button">
          <SessionIconButton
            iconType={SessionIconType.Exit}
            iconSize={SessionIconSize.Medium}
            onClick={onCloseOverlay}
          />
        </div>

        <div className="button-group">
          <SessionButton
            buttonType={SessionButtonType.Default}
            buttonColor={SessionButtonColor.Danger}
            text={i18n('delete')}
            onClick={onDeleteSelectedMessages}
          />
        </div>
      </div>
    );
  }

  public render() {
    const { id, isGroup, isPublic } = this.props;
    const triggerId = `conversation-${id}-${Date.now()}`;

    const isPrivateGroup = isGroup && !isPublic;

    return (
      <>
        {this.renderSelectionOverlay()}
        <div className="module-conversation-header">
          {this.renderBackButton()}
          <div className="module-conversation-header__title-container">
            <div className="module-conversation-header__title-flex">
              {this.renderOptions(triggerId)}
              {this.renderTitle()}
              {isPrivateGroup ? this.renderMemberCount() : null}
            </div>
          </div>
          {this.renderExpirationLength()}
          {this.renderSearch()}
          {this.renderAvatar()}
          {this.renderMenu(triggerId)}
        </div>
      </>
    );
  }

  public onAvatarClick(userPubKey: string) {
    if (this.props.onAvatarClick) {
      this.props.onAvatarClick(userPubKey);
    }
  }

  private renderMemberCount() {
    const memberCount = this.props.members.length;

    if (memberCount === 0) {
      return null;
    }

    const wordForm = memberCount === 1 ? 'member' : 'members';

    return (
      <span className="member-preview">{`(${memberCount} ${wordForm})`}</span>
    );
  }

  private renderPublicMenuItems() {
    const {
      i18n,
      isBlocked,
      isMe,
      isGroup,
      isArchived,
      isPublic,
      isRss,
      onResetSession,
      onSetDisappearingMessages,
      // onShowAllMedia,
      onShowGroupMembers,
      onShowSafetyNumber,
      onArchive,
      onMoveToInbox,
      timerOptions,
      onBlockUser,
      onUnblockUser,
      hasNickname,
      onClearNickname,
      onChangeNickname,
    } = this.props;

    if (isPublic || isRss) {
      return null;
    }

    const disappearingTitle = i18n('disappearingMessages') as any;

    const blockTitle = isBlocked ? i18n('unblockUser') : i18n('blockUser');
    const blockHandler = isBlocked ? onUnblockUser : onBlockUser;

    const disappearingMessagesMenuItem = (
      <SubMenu title={disappearingTitle}>
        {(timerOptions || []).map(item => (
          <MenuItem
            key={item.value}
            onClick={() => {
              onSetDisappearingMessages(item.value);
            }}
          >
            {item.name}
          </MenuItem>
        ))}
      </SubMenu>
    );
    const showMembersMenuItem = isGroup && (
      <MenuItem onClick={onShowGroupMembers}>{i18n('showMembers')}</MenuItem>
    );
    const showSafetyNumberMenuItem = !isGroup &&
      !isMe && (
        <MenuItem onClick={onShowSafetyNumber}>
          {i18n('showSafetyNumber')}
        </MenuItem>
      );
    const resetSessionMenuItem = !isGroup && (
      <MenuItem onClick={onResetSession}>{i18n('resetSession')}</MenuItem>
    );
    const blockHandlerMenuItem = !isMe &&
      !isGroup && <MenuItem onClick={blockHandler}>{blockTitle}</MenuItem>;
    const changeNicknameMenuItem = !isMe &&
      !isGroup && (
        <MenuItem onClick={onChangeNickname}>{i18n('changeNickname')}</MenuItem>
      );
    const clearNicknameMenuItem = !isMe &&
      !isGroup &&
      hasNickname && (
        <MenuItem onClick={onClearNickname}>{i18n('clearNickname')}</MenuItem>
      );
    const archiveConversationMenuItem = isArchived ? (
      <MenuItem onClick={onMoveToInbox}>
        {i18n('moveConversationToInbox')}
      </MenuItem>
    ) : (
      <MenuItem onClick={onArchive}>{i18n('archiveConversation')}</MenuItem>
    );

    return (
      <React.Fragment>
        {/* <MenuItem onClick={onShowAllMedia}>{i18n('viewAllMedia')}</MenuItem> */}
        {disappearingMessagesMenuItem}
        {showMembersMenuItem}
        {showSafetyNumberMenuItem}
        {resetSessionMenuItem}
        {blockHandlerMenuItem}
        {changeNicknameMenuItem}
        {clearNicknameMenuItem}
        {archiveConversationMenuItem}
      </React.Fragment>
    );
  }
}
