import React, { useRef } from 'react';
import { GrafanaTheme2, NavModelItem } from '@grafana/data';
import { CollapsableSection, CustomScrollbar, Icon, IconName, useStyles2 } from '@grafana/ui';
import { FocusScope } from '@react-aria/focus';
import { useDialog } from '@react-aria/dialog';
import { useOverlay } from '@react-aria/overlays';
import { css, cx, keyframes } from '@emotion/css';
import { NavBarMenuItem } from './NavBarMenuItem';
import { NavBarItemWithoutMenu } from './NavBarItemWithoutMenu';
import { isMatchOrChildMatch } from '../utils';

export interface Props {
  activeItem?: NavModelItem;
  navItems: NavModelItem[];
  onClose: () => void;
}

export function NavBarMenu({ activeItem, navItems, onClose }: Props) {
  const styles = useStyles2(getStyles);
  const ref = useRef(null);
  const { dialogProps } = useDialog({}, ref);
  const { overlayProps } = useOverlay(
    {
      isDismissable: true,
      isOpen: true,
      onClose,
    },
    ref
  );

  return (
    <FocusScope contain restoreFocus autoFocus>
      <div data-testid="navbarmenu" className={styles.container} ref={ref} {...overlayProps} {...dialogProps}>
        <nav className={styles.content}>
          <CustomScrollbar hideHorizontalTrack>
            <ul className={styles.itemList}>
              {navItems.map((link) =>
                linkHasChildren(link) ? (
                  <MenuItem key={link.text} link={link} isActive={isMatchOrChildMatch(link, activeItem)}>
                    <ul>
                      {link.children.map(
                        (childLink) =>
                          !childLink.divider && (
                            <NavBarMenuItem
                              key={`${link.text}-${childLink.text}`}
                              isActive={activeItem === childLink}
                              isDivider={childLink.divider}
                              onClick={() => {
                                childLink.onClick?.();
                                onClose();
                              }}
                              styleOverrides={styles.item}
                              target={childLink.target}
                              text={childLink.text}
                              url={childLink.url}
                              isMobile={true}
                            />
                          )
                      )}
                    </ul>
                  </MenuItem>
                ) : link.id === 'saved-items' ? (
                  <MenuItem
                    key={link.text}
                    link={link}
                    isActive={isMatchOrChildMatch(link, activeItem)}
                    className={styles.savedItems}
                  >
                    <em className={styles.savedItemsText}>No saved items</em>
                  </MenuItem>
                ) : (
                  <li key={link.text} className={styles.flex}>
                    <NavBarItemWithoutMenu
                      className={styles.itemWithoutMenu}
                      elClassName={styles.fullWidth}
                      label={link.text}
                      url={link.url}
                      target={link.target}
                      onClick={() => {
                        link.onClick?.();
                        onClose();
                      }}
                      isActive={link === activeItem}
                    >
                      <div className={styles.savedItemsMenuItemWrapper}>
                        {link.img && (
                          <img
                            src={link.img}
                            alt={`${link.text} logo`}
                            height="24"
                            width="24"
                            style={{ borderRadius: '50%' }}
                          />
                        )}
                        {link.icon && <Icon name={link.icon as IconName} size="xl" />}
                        <span className={styles.linkText}>{link.text}</span>
                      </div>
                    </NavBarItemWithoutMenu>
                  </li>
                )
              )}
            </ul>
          </CustomScrollbar>
        </nav>
      </div>
    </FocusScope>
  );
}

NavBarMenu.displayName = 'NavBarMenu';

function MenuItem({
  link,
  isActive,
  children,
  className,
}: {
  link: NavModelItem;
  isActive?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const styles = useStyles2(getStyles);

  return (
    <li className={cx(styles.menuItem, className)}>
      <NavBarItemWithoutMenu
        isActive={isActive}
        label={link.text}
        url={link.url}
        target={link.target}
        onClick={link.onClick}
        className={styles.collapsableMenuItem}
      >
        {link.img && (
          <img src={link.img} alt={`${link.text} logo`} height="24" width="24" style={{ borderRadius: '50%' }} />
        )}
        {link.icon && <Icon name={link.icon as IconName} size="xl" />}
      </NavBarItemWithoutMenu>
      <div className={styles.collapsableSectionWrapper}>
        <CollapsableSection
          isOpen={false}
          className={styles.collapseWrapper}
          contentClassName={styles.collapseContent}
          label={
            <div className={cx(styles.labelWrapper, { [styles.primary]: isActive })}>
              <span className={styles.linkText}>{link.text}</span>
            </div>
          }
        >
          {children}
        </CollapsableSection>
      </div>
    </li>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  const fadeIn = keyframes`
    from {
      background-color: ${theme.colors.background.primary};
      width: ${theme.spacing(7)};
    }
    to {
      background-color: ${theme.colors.background.canvas};
      width: 300px;
    }`;

  return {
    collapseContent: css({
      padding: 0,
      paddingLeft: theme.spacing(1.25),
    }),
    collapseWrapper: css({
      borderRadius: theme.shape.borderRadius(2),
      paddingRight: theme.spacing(4.25),
      height: theme.spacing(6),
      alignItems: 'center',
    }),
    menuItem: css({
      position: 'relative',
      display: 'flex',
    }),
    itemWithoutMenu: css({
      position: 'relative',
      placeItems: 'inherit',
      justifyContent: 'start',
      display: 'flex',
      flexGrow: 1,
      alignItems: 'center',
    }),
    container: css({
      animation: `150ms ease-in 0s 1 normal forwards ${fadeIn}`,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      left: 0,
      whiteSpace: 'nowrap',
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1.5),
      right: 0,
      zIndex: 9999,
      top: 0,
      [theme.breakpoints.up('md')]: {
        borderRight: `1px solid ${theme.colors.border.weak}`,
        right: 'unset',
      },
    }),
    primary: css({
      color: theme.colors.text.primary,
    }),
    content: css({
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto',
    }),
    itemList: css({
      display: 'grid',
      gridAutoRows: `minmax(${theme.spacing(6)}, auto)`,
    }),
    item: css({
      padding: `${theme.spacing(1)} 0`,
      '&::before': {
        display: 'none',
      },
    }),
    linkText: css({
      fontSize: theme.typography.pxToRem(14),
      justifySelf: 'start',
    }),
    labelWrapper: css({
      fontSize: '15px',
      color: theme.colors.text.secondary,
    }),
    savedItems: css({
      background: theme.colors.background.secondary,
    }),
    savedItemsText: css({
      display: 'block',
      paddingBottom: theme.spacing(2),
      color: theme.colors.text.secondary,
    }),
    savedItemsMenuItemWrapper: css({
      display: 'grid',
      gridAutoFlow: 'column',
      gridTemplateColumns: `${theme.spacing(7)} auto`,
      alignItems: 'center',
    }),
    flex: css({
      display: 'flex',
    }),
    fullWidth: css({
      width: '100%',
    }),
    collapsableMenuItem: css({
      height: theme.spacing(6),
      width: theme.spacing(7),
      display: 'grid',
      placeContent: 'center',
    }),
    collapsableSectionWrapper: css({
      display: 'flex',
      flexGrow: 1,
      alignSelf: 'start',
      flexDirection: 'column',
    }),
  };
};

function linkHasChildren(link: NavModelItem): link is NavModelItem & { children: NavModelItem[] } {
  return Boolean(link.children && link.children.length > 0);
}
