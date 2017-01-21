import chai from 'chai';
import _ from 'lodash';
import {generateUser, generateProfile, generatePost, generateComment} from './factories';
import {generateArray} from './helpers';
import serializer from 'serializer';

const {expect} = chai;

describe('plain serialization', () => {
    it("check serialization with deep tree", () => {
        const user = generateUser(); // user
        user.profile = generateProfile();
        user.friends = generateArray(1, 1, () => { // user.friends
            const friend = generateUser();
            friend.posts = generateArray(1, 1, () => { // user.friends.posts
                const post = generatePost();
                post.comments = generateArray(2, 4, () => generateComment()); // user.friends.posts.comments
                return post;
            });
            return friend;
        });
        user.posts = generateArray(1, 1, () => {  // user.posts
            const post = generatePost();
            post.comments = generateArray(1, 1, () => generateComment()); // user.posts.comments
            return post;
        });

        const serializedUser = serializer(user, {type: 'users'});
        const expectedResult = {
            data: {
                id: user.id,
                type: 'users',
                attributes: {
                    email: user.email,
                    passwordHash: user.passwordHash
                },
                relationships: {
                    profile: {
                        data: {
                            id: user.profile.id,
                            type: 'profile'
                        }
                    },
                    posts: {
                        data: _.map(user.posts, (post) => {
                            return {
                                id: post.id,
                                type: 'posts'
                            }
                        })
                    },
                    friends: {
                        data: _.map(user.friends, (friend) => {
                            return {
                                id: friend.id,
                                type: 'friends'
                            };
                        })
                    },
                }
            },
            included: _.concat(
                [
                    {
                        id: user.profile.id,
                        type: 'profile',
                        attributes: {
                            name: user.profile.name,
                            surname: user.profile.surname,
                        }
                    }
                ],
                _.map(user.friends, (friend) => {
                    return {
                        id: friend.id,
                        type: 'friends',
                        attributes: {
                            email: friend.email,
                            passwordHash: friend.passwordHash
                        },
                        relationships: {
                            posts: {
                                data: _.map(friend.posts, (post) => {
                                    return {
                                        id: post.id,
                                        type: 'posts'
                                    }
                                })
                            }
                        }
                    }
                }),
                _.flatten(_.map(user.friends, (friend) => {
                    return _.map(friend.posts, (post) => {
                        return {
                            id: post.id,
                            type: 'posts',
                            attributes: {
                                title: post.title
                            },
                            relationships: {
                                comments: {
                                    data: _.map(post.comments, (comment) => {
                                        return {
                                            id: comment.id,
                                            type: 'comments'
                                        }
                                    })
                                }
                            }
                        };
                    })
                })),
                _.flatten(_.map(user.friends, (friend) => {
                    return _.flatten(_.map(friend.posts, (post) => {
                        return _.map(post.comments, (comment) => {
                            return {
                                id: comment.id,
                                type: 'comments',
                                attributes: {
                                    title: comment.title,
                                    body: comment.body,
                                    rate: comment.rate
                                }
                            };
                        });
                    }))
                })),
                _.map(user.posts, (post) => {
                    return {
                        id: post.id,
                        type: 'posts',
                        attributes: {
                            title: post.title
                        },
                        relationships: {
                            comments: {
                                data: _.map(post.comments, (comment) => {
                                    return {
                                        id: comment.id,
                                        type: 'comments'
                                    }
                                })
                            }
                        }
                    }
                }),
                _.flatten(_.map(user.posts, (post) => {
                    return _.map(post.comments, (comment) => {
                        return {
                            id: comment.id,
                            type: 'comments',
                            attributes: {
                                title: comment.title,
                                body: comment.body,
                                rate: comment.rate
                            }
                        }
                    })
                })),
            )
        };

        expect(serializedUser).to.deep.eql(expectedResult);
    });
});