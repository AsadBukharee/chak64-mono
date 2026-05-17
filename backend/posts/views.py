from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from .models import (
    Post, Comment, Campaign, Donation, Team, TeamMember, NeedyPerson,
    Poll, PollOption, PollVote, Survey, SurveyResponse, Report,
    Advertisement, LiveBroadcast, ZakatCollection, AboutSection,
    CharityType, FundType, Personality, VillageHistory,
)
from .serializers import (
    PostSerializer, CommentSerializer, CampaignSerializer, DonationSerializer,
    TeamSerializer, TeamMemberSerializer, NeedyPersonSerializer,
    PollSerializer, PollOptionSerializer, PollVoteSerializer,
    SurveySerializer, SurveyResponseSerializer, ReportSerializer,
    AdvertisementSerializer, LiveBroadcastSerializer, ZakatCollectionSerializer,
    AboutSectionSerializer, CharityTypeSerializer, FundTypeSerializer,
    PersonalitySerializer, VillageHistorySerializer,
)


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    filterset_fields = ['author_email', 'media_type', 'visibility', 'is_post_of_the_day']
    ordering_fields = ['created_date', 'likes_count']

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        # For feed: show public posts + user's own private posts
        if user.is_authenticated:
            qs = qs.filter(
                Q(visibility='public') | Q(author_email=user.email)
            )
        else:
            qs = qs.filter(visibility='public')
        return qs

    @action(detail=False, methods=['get'], url_path='post-of-the-day')
    def post_of_the_day(self, request):
        post = Post.objects.filter(is_post_of_the_day=True).order_by('-created_date').first()
        if post:
            serializer = self.get_serializer(post)
            return Response(serializer.data)
        return Response(None)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    filterset_fields = {
        'post__id': ['exact'],
        'author_email': ['exact'],
    }
    ordering_fields = ['created_date']

    def get_queryset(self):
        qs = super().get_queryset()
        # Support frontend's post_id filter
        post_id = self.request.query_params.get('post_id')
        if post_id:
            qs = qs.filter(post_id=post_id)
        return qs


class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer
    filterset_fields = ['is_active', 'campaign_id']
    ordering_fields = ['created_date', 'start_date', 'end_date']


class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    filterset_fields = ['donation_type', 'campaign_id', 'donor_email', 'charity_type', 'fund_type']
    ordering_fields = ['created_date', 'amount']


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    filterset_fields = ['team_type', 'status']
    ordering_fields = ['created_date', 'name']


class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    filterset_fields = ['member_email']
    ordering_fields = ['created_date']

    def get_queryset(self):
        qs = super().get_queryset()
        team_id = self.request.query_params.get('team_id')
        if team_id:
            qs = qs.filter(team_id=team_id)
        return qs


class NeedyPersonViewSet(viewsets.ModelViewSet):
    queryset = NeedyPerson.objects.all()
    serializer_class = NeedyPersonSerializer
    filterset_fields = ['need_type', 'priority', 'status', 'added_by']
    ordering_fields = ['created_date']

    def get_queryset(self):
        qs = super().get_queryset()
        team_id = self.request.query_params.get('team_id')
        if team_id:
            qs = qs.filter(team_id=team_id)
        return qs


class PollViewSet(viewsets.ModelViewSet):
    queryset = Poll.objects.all()
    serializer_class = PollSerializer
    filterset_fields = ['is_active']
    ordering_fields = ['created_date', 'total_votes']


class PollOptionViewSet(viewsets.ModelViewSet):
    queryset = PollOption.objects.all()
    serializer_class = PollOptionSerializer
    ordering_fields = ['created_date', 'votes_count']

    def get_queryset(self):
        qs = super().get_queryset()
        poll_id = self.request.query_params.get('poll_id')
        if poll_id:
            qs = qs.filter(poll_id=poll_id)
        return qs


class PollVoteViewSet(viewsets.ModelViewSet):
    queryset = PollVote.objects.all()
    serializer_class = PollVoteSerializer
    filterset_fields = ['voter_email']

    def get_queryset(self):
        qs = super().get_queryset()
        poll_id = self.request.query_params.get('poll_id')
        voter_email = self.request.query_params.get('voter_email')
        if poll_id:
            qs = qs.filter(poll_id=poll_id)
        if voter_email:
            qs = qs.filter(voter_email=voter_email)
        return qs


class SurveyViewSet(viewsets.ModelViewSet):
    queryset = Survey.objects.all()
    serializer_class = SurveySerializer
    filterset_fields = ['survey_type', 'status', 'created_by']
    ordering_fields = ['created_date']

    def get_queryset(self):
        qs = super().get_queryset()
        team_id = self.request.query_params.get('team_id')
        if team_id:
            qs = qs.filter(team_id=team_id)
        return qs


class SurveyResponseViewSet(viewsets.ModelViewSet):
    queryset = SurveyResponse.objects.all()
    serializer_class = SurveyResponseSerializer
    filterset_fields = ['submitted_by']
    ordering_fields = ['created_date']

    def get_queryset(self):
        qs = super().get_queryset()
        survey_id = self.request.query_params.get('survey_id')
        team_id = self.request.query_params.get('team_id')
        if survey_id:
            qs = qs.filter(survey_id=survey_id)
        if team_id:
            qs = qs.filter(team_id=team_id)
        return qs


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    filterset_fields = ['reason', 'status', 'reporter_email']
    ordering_fields = ['created_date']

    def get_queryset(self):
        qs = super().get_queryset()
        post_id = self.request.query_params.get('post_id')
        if post_id:
            qs = qs.filter(post_id=post_id)
        return qs


class AdvertisementViewSet(viewsets.ModelViewSet):
    queryset = Advertisement.objects.all()
    serializer_class = AdvertisementSerializer
    filterset_fields = ['is_active', 'placement']
    ordering_fields = ['created_date']


class LiveBroadcastViewSet(viewsets.ModelViewSet):
    queryset = LiveBroadcast.objects.all()
    serializer_class = LiveBroadcastSerializer
    filterset_fields = ['is_live', 'broadcaster_email']
    ordering_fields = ['created_date', 'start_time']


class ZakatCollectionViewSet(viewsets.ModelViewSet):
    queryset = ZakatCollection.objects.all()
    serializer_class = ZakatCollectionSerializer
    filterset_fields = ['status', 'collector_email']
    ordering_fields = ['created_date', 'collection_date']

    def get_queryset(self):
        qs = super().get_queryset()
        team_id = self.request.query_params.get('team_id')
        if team_id:
            qs = qs.filter(team_id=team_id)
        return qs


class AboutSectionViewSet(viewsets.ModelViewSet):
    queryset = AboutSection.objects.all()
    serializer_class = AboutSectionSerializer
    filterset_fields = ['section_key']
    ordering_fields = ['order']


class CharityTypeViewSet(viewsets.ModelViewSet):
    queryset = CharityType.objects.all()
    serializer_class = CharityTypeSerializer
    ordering_fields = ['name']


class FundTypeViewSet(viewsets.ModelViewSet):
    queryset = FundType.objects.all()
    serializer_class = FundTypeSerializer
    ordering_fields = ['name']


class PersonalityViewSet(viewsets.ModelViewSet):
    queryset = Personality.objects.all()
    serializer_class = PersonalitySerializer
    ordering_fields = ['created_date', 'name']


class VillageHistoryViewSet(viewsets.ModelViewSet):
    queryset = VillageHistory.objects.all()
    serializer_class = VillageHistorySerializer
    ordering_fields = ['order', 'created_date']
