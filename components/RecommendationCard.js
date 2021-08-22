import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import queryString from 'query-string';
import { get, has } from 'lodash';

import List from '../components/List';

const ocWebsiteUrl = process.env.WEBSITE_URL || 'https://opencollective.com';

const ocImagesUrl =
  process.env.IMAGES_URL || 'https://images.opencollective.com';

export default class RecommendationCard extends React.Component {
  static propTypes = {
    recommendation: PropTypes.object.isRequired,
    opencollectiveAccount: PropTypes.object,
  };

  budgetFormatter = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  });

  formatBudget = (amount) =>
    `${this.budgetFormatter.format(Math.round(amount))} USD`;

  formatDonation = (amount) => {
    if (amount > 1000) {
      return `$${Math.round(amount / 1000)}K`;
    } else {
      return `$${Math.round(amount)}`;
    }
  };

  formatBackingAmount = (amount) =>
    `${this.budgetFormatter.format(Math.round(amount))}`;

  formatBackingDate = (date) => moment(new Date(date)).format('MMM YYYY');

  nextGoal = (recommendation) => {
    const goals = get(recommendation, 'opencollective.goals', []);
    const balance = get(recommendation, 'opencollective.stats.balance', 0);

    const sortedAndFilteredGoals = goals
      .filter((goal) => goal.type && goal.amount)
      .filter((goal) => goal.type === 'yearlyBudget')
      .filter((goal) => goal.amount > balance)
      .sort((a, b) => a.amount - b.amount);

    return sortedAndFilteredGoals[0];
  };

  nextGoalPercentage = (recommendation) => {
    const balance = get(recommendation, 'opencollective.stats.balance', 0);
    const goal = this.nextGoal(recommendation);

    return goal ? Math.round((balance / goal.amount) * 100) : null;
  };

  nextGoaltitle = (recommendation) => {
    const goal = this.nextGoal(recommendation);

    return get(goal, 'title', null);
  };

  backerItem = (backer) => (
    <span key={backer.id}>
      <a href={`${ocWebsiteUrl}/${backer.slug}`}>{backer.name}</a>
      &nbsp;
      <span>({this.formatDonation(backer.totalDonations / 100)})</span>
    </span>
  );

  githubRepoItem = (repo) => (
    <span key={repo.id}>
      {repo.full_name && (
        <a href={`https://github.com/${repo.full_name}`}>{repo.name}</a>
      )}
      {!repo.full_name && <span>{repo.name}</span>}
    </span>
  );

  getMatchingOrder = (recommendation, opencollectiveAccount) =>
    opencollectiveAccount &&
    get(opencollectiveAccount, 'orders.nodes', []).find(
      (order) =>
        recommendation.opencollective &&
        recommendation.opencollective.slug === order.toAccount.slug,
    );

  ocLogoSrc = () => {
    const opencollective = this.props.recommendation.opencollective;

    if (opencollective) {
      return `${ocImagesUrl}/${opencollective.slug}/logo.png?height=55`;
    }
  };

  ocLogoStyle = () => {
    const opencollective = this.props.recommendation.opencollective;

    const style = {};

    if (opencollective) {
      style.backgroundImage = `url(${ocImagesUrl}/${opencollective.slug}/background.png?height=250)`;
      style.backgroundPosition = 'center top';
    }

    return style;
  };

  contributeUrl = () => {
    const { name, opencollective, github } = this.props.recommendation;

    let url;
    const urlParams = {};
    if (opencollective) {
      url = `${ocWebsiteUrl}/${opencollective.slug}`;
    } else if (github) {
      url = `${ocWebsiteUrl}/pledges/new`;
      urlParams.name = name;
      urlParams.githubHandle = github.org || github.repo;
    }

    if (process.env.OPENCOLLECTIVE_REFERRAL) {
      urlParams.referral = process.env.OPENCOLLECTIVE_REFERRAL;
    }

    if (Object.keys(urlParams).length) {
      url += `?${queryString.stringify(urlParams)}`;
    }

    return url;
  };

  render() {
    const { recommendation, opencollectiveAccount } = this.props;

    const order = this.getMatchingOrder(recommendation, opencollectiveAccount);

    const backers = get(recommendation, 'opencollective.sponsors', []).filter(
      (backer) =>
        !opencollectiveAccount || opencollectiveAccount.slug !== backer.slug,
    );

    const yearlyBudget = get(
      recommendation,
      'opencollective.stats.yearlyBudget',
      0,
    );

    const existingPledge = get(recommendation, 'opencollective.pledge', false);

    const firstPledge = !has(recommendation, 'opencollective');

    return (
      <Fragment>
        <style jsx>
          {`
            .Recommendation {
              box-sizing: border-box;
              width: 290px;
              min-height: 500px;
              border-radius: 15px;
              background-color: #ffffff;
              border: 1px solid #c1c6cc;
              padding: 20px;
              margin-bottom: 30px;
              position: relative;
              color: #2e3033;
              padding-bottom: 100px;
            }

            .Recommendation.backing {
              background: url('/static/img/sponsor-badge.png') no-repeat right
                top;
              background-size: 125px 125px;
            }

            .Recommendation .logo {
              margin-bottom: 10px;
              width: 55px;
              height: 55px;
            }
            .Recommendation .logo img {
              display: block;
            }
            .Recommendation .logo.bys img {
              width: 55px;
              height: 55px;
              border-radius: 12px;
            }
            .Recommendation .logo.oc {
              border-radius: 12px;
              background-color: #fcfcfc;
            }
            .Recommendation .logo.oc img {
              width: 45px;
              height: 45px;
              padding: 5px;
            }
            .Recommendation .logo.empty {
              width: 55px;
              height: 55px;
              border-radius: 12px;
              border: 1px dotted #ccc;
              background-color: #fcfcfc;
            }

            .Recommendation .name {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 10px;
              text-transform: capitalize;
            }

            .Recommendation .description {
              font-size: 13px;
              line-height: 19px;
              margin-bottom: 20px;
              min-height: 50px;
            }
            .Recommendation .repos,
            .Recommendation .backers {
              margin-bottom: 20px;
            }
            .Recommendation .repos,
            .Recommendation .backers {
              color: #6e747a;
            }
            .Recommendation .repos strong,
            .Recommendation .backers strong,
            .Recommendation .budget {
              font-weight: 500;
              color: #2e3033;
            }
            .Recommendation .repos a,
            .Recommendation .backers a {
              color: #6e747a;
            }
            .Recommendation .repos a:hover,
            .Recommendation .backers a:hover {
              color: inherit;
              text-decoration: none;
            }

            .secondPart {
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              box-sizing: border-box;
              padding: 20px;
            }

            .bigButton {
              box-sizing: border-box;
              border-radius: 6px;
              padding: 10px;
            }

            .backingButton small {
              font-size: 12px;
            }

            .andOthers .noWrap {
              white-space: nowrap;
            }
            .andOthers:before {
              content: '\u00A0 ';
            }

            .contributeButton.existingPledge,
            .contributeButton.firstPledge {
              background-color: #3385ff;
            }

            .noGoal {
              color: #6e747a;
              font-style: italic;
            }

            .meter {
              height: 4px;
              background: #efecea;
              border-radius: 2px;
              margin: 5px 0;
            }
            .meter span {
              display: block;
              height: 4px;
              background: #00b856;
              border-radius: 2px;
            }
            @media screen and (max-width: 768px),
              @media screen and (max-width: 500px) {
              .Recommendation {
                width: 100%;
                margin: 0;
                margin-bottom: 20px;
                height: auto;
                min-height: 0;
              }
            }
          `}
        </style>

        <div className={classNames('Recommendation', { backing: !!order })}>
          {recommendation.logo && (
            <div className="logo bys">
              <img src={recommendation.logo} alt="" />
            </div>
          )}
          {!recommendation.logo &&
            recommendation.opencollective &&
            !recommendation.opencollective.pledge && (
              <div className="logo oc" style={this.ocLogoStyle()}>
                <img src={this.ocLogoSrc()} alt="" />
              </div>
            )}
          {!recommendation.logo &&
            (!recommendation.opencollective ||
              recommendation.opencollective.pledge) && (
              <div className="logo empty" />
            )}

          <div className="name">
            <b>
              {get(recommendation, 'opencollective.name', recommendation.name)}
            </b>
          </div>

          <div className="description">
            {get(
              recommendation,
              'opencollective.description',
              recommendation.description,
            )}
          </div>

          {recommendation.repos && recommendation.repos.length > 0 && (
            <div className="repos">
              <strong>Used in</strong>:<br />
              <List
                array={recommendation.repos}
                map={this.githubRepoItem}
                cut={3}
              />
            </div>
          )}

          {(order || backers.length > 0) && (
            <div className="backers">
              <strong>Backers</strong>:<br />
              {order && (
                <Fragment>
                  <a href={`${ocWebsiteUrl}/${opencollectiveAccount.slug}`}>
                    {opencollectiveAccount.name}
                  </a>{' '}
                  ({this.formatBackingAmount(order.totalDonations.value)} since{' '}
                  {this.formatBackingDate(order.createdAt)}
                  ).
                </Fragment>
              )}
              {order && backers.length > 0 && <Fragment>{' Also: '}</Fragment>}
              {backers.length > 0 && (
                <List array={backers} map={this.backerItem} cut={3} />
              )}
            </div>
          )}

          {yearlyBudget > 0 && (
            <Fragment>
              <div className="budget">
                Yearly budget: {this.formatBudget(yearlyBudget / 100)}
              </div>
              {this.nextGoal(recommendation) && (
                <Fragment>
                  <div className="meter">
                    <span
                      style={{
                        width: `${this.nextGoalPercentage(recommendation)}%`,
                      }}
                    />
                  </div>
                  <div className="goal">
                    <strong>{this.nextGoalPercentage(recommendation)}%</strong>{' '}
                    progress to reach their next goal:
                    <br />
                    {this.nextGoaltitle(recommendation)}
                  </div>
                </Fragment>
              )}
            </Fragment>
          )}

          {firstPledge && (
            <div className="description">
              <em>
                To our knowledge, this project is not on Open Collective or
                other funding platform. You can create a pledge. This will
                incentivize them to start collecting money to fund their
                activities.
              </em>
            </div>
          )}

          {existingPledge && (
            <div className="description">
              <em>
                At least one person (or organization) already pledged to this
                project on Open Collective. You can add your pledge. This will
                incentivize them to start collecting money to fund their
                activities.
              </em>
            </div>
          )}

          <div className="secondPart">
            <a
              className={classNames('bigButton', 'contributeButton', {
                existingPledge,
                firstPledge,
              })}
              href={this.contributeUrl()}
            >
              {firstPledge
                ? 'Pledge'
                : existingPledge
                ? 'Pledge'
                : 'Contribute'}
            </a>
          </div>
        </div>
      </Fragment>
    );
  }
}
